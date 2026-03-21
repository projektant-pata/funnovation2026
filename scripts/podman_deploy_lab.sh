#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
BUILD_DIR="${ROOT_DIR}/build/podman-lab"
CONTAINERFILE="${BUILD_DIR}/Containerfile"

LAB_IMAGE="${LAB_IMAGE:-funnovation2026-podman-lab:latest}"
LAB_NAME="${LAB_NAME:-funnovation2026-podman-lab}"
LAB_PORT="${LAB_PORT:-4030}"
LAB_STORAGE_SIZE="${LAB_STORAGE_SIZE:-8g}"
LAB_BASE_IMAGE="${LAB_BASE_IMAGE:-registry.fedoraproject.org/fedora:41}"

usage() {
  cat <<'EOF'
Usage: sudo ./scripts/podman_deploy_lab.sh <command>

Commands:
  up       Build the lab image, start the outer container, and deploy dist/ inside nested Podman
  shell    Open an interactive shell inside the outer lab container
  status   Show the outer container and nested Podman status
  logs     Show nested compose logs from inside the lab container
  down     Stop nested compose, then remove the outer lab container
  rebuild  Force a rebuild of the lab image, then run "up"
EOF
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "This script must be run as root." >&2
    exit 1
  fi
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_dist() {
  local required=(
    "${DIST_DIR}/docker-compose.yml"
    "${DIST_DIR}/funnovation2026-db.tar"
    "${DIST_DIR}/funnovation2026-frontend.tar"
  )

  for path in "${required[@]}"; do
    if [[ ! -f "${path}" ]]; then
      echo "Missing distribution artifact: ${path}" >&2
      exit 1
    fi
  done
}

write_containerfile() {
  mkdir -p "${BUILD_DIR}"
  cat > "${CONTAINERFILE}" <<EOF
FROM ${LAB_BASE_IMAGE}

RUN dnf install -y \
      podman \
      podman-compose \
      fuse-overlayfs \
      slirp4netns \
      iproute \
      procps-ng \
      findutils \
      shadow-utils \
  && dnf clean all

ENV XDG_RUNTIME_DIR=/run/user/0

CMD ["bash", "-lc", "mkdir -p /run/user/0 && chmod 700 /run/user/0 && exec sleep infinity"]
EOF
}

build_lab_image() {
  write_containerfile
  podman build -t "${LAB_IMAGE}" -f "${CONTAINERFILE}" "${BUILD_DIR}"
}

container_exists() {
  podman container exists "${LAB_NAME}"
}

run_outer_container() {
  if container_exists; then
    podman rm -f "${LAB_NAME}" >/dev/null
  fi

  podman run -d \
    --name "${LAB_NAME}" \
    --hostname "${LAB_NAME}" \
    --privileged \
    --network host \
    --security-opt label=disable \
    --replace \
    --tmpfs /run:size=64m \
    --tmpfs /tmp:size=512m \
    --tmpfs /var/lib/containers:exec,size="${LAB_STORAGE_SIZE}" \
    -e XDG_RUNTIME_DIR=/run/user/0 \
    -v "${DIST_DIR}:/opt/dist:ro" \
    "${LAB_IMAGE}" >/dev/null
}

exec_in_lab() {
  podman exec \
    -e XDG_RUNTIME_DIR=/run/user/0 \
    "${LAB_NAME}" \
    bash -lc "$1"
}

deploy_inside_lab() {
  exec_in_lab '
    set -euo pipefail
    mkdir -p /run/user/0
    chmod 700 /run/user/0
    podman load -i /opt/dist/funnovation2026-db.tar
    podman load -i /opt/dist/funnovation2026-frontend.tar
    cd /opt/dist
    podman compose up -d
    podman compose ps
  '
}

show_status() {
  podman ps --filter "name=${LAB_NAME}"
  if container_exists; then
    exec_in_lab '
      set -euo pipefail
      mkdir -p /run/user/0
      chmod 700 /run/user/0
      echo
      echo "Nested podman:"
      podman ps -a
      echo
      echo "Nested compose:"
      cd /opt/dist
      podman compose ps
    '
  fi
}

show_logs() {
  if ! container_exists; then
    echo "Outer lab container does not exist: ${LAB_NAME}" >&2
    exit 1
  fi

  exec_in_lab '
    set -euo pipefail
    mkdir -p /run/user/0
    chmod 700 /run/user/0
    cd /opt/dist
    podman compose logs --tail=200
  '
}

open_shell() {
  if ! container_exists; then
    echo "Outer lab container does not exist: ${LAB_NAME}" >&2
    exit 1
  fi

  podman exec -it \
    -e XDG_RUNTIME_DIR=/run/user/0 \
    "${LAB_NAME}" \
    bash -lc 'mkdir -p /run/user/0 && chmod 700 /run/user/0 && exec bash'
}

teardown_lab() {
  if container_exists; then
    exec_in_lab '
      set -euo pipefail
      mkdir -p /run/user/0
      chmod 700 /run/user/0
      cd /opt/dist
      podman compose down -v || true
    ' || true

    podman rm -f "${LAB_NAME}" >/dev/null || true
  fi
}

cmd_up() {
  ensure_dist
  if ! podman image exists "${LAB_IMAGE}"; then
    build_lab_image
  fi
  run_outer_container
  deploy_inside_lab
  echo "Deployment lab is running."
  echo "Host port ${LAB_PORT} should be reachable if the inner compose published it successfully."
  echo "Use: sudo ./scripts/podman_deploy_lab.sh shell"
}

cmd_rebuild() {
  ensure_dist
  teardown_lab
  build_lab_image
  run_outer_container
  deploy_inside_lab
  echo "Deployment lab rebuilt and started."
}

main() {
  require_root
  require_cmd podman

  local command="${1:-}"

  case "${command}" in
    up)
      cmd_up
      ;;
    shell)
      open_shell
      ;;
    status)
      show_status
      ;;
    logs)
      show_logs
      ;;
    down)
      teardown_lab
      ;;
    rebuild)
      cmd_rebuild
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "${@}"
