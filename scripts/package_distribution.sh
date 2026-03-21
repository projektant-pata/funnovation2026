#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${ROOT_DIR}/build/distribution"
DB_CONTEXT_DIR="${BUILD_DIR}/db-image"
DIST_DIR="${ROOT_DIR}/dist"

FRONTEND_IMAGE_REPO="funnovation2026-frontend"
DB_IMAGE_REPO="funnovation2026-db"
IMAGE_TAG="latest"

FRONTEND_IMAGE="${FRONTEND_IMAGE_REPO}:${IMAGE_TAG}"
DB_IMAGE="${DB_IMAGE_REPO}:${IMAGE_TAG}"

DEFAULT_SOPS_KEY="${HOME}/.config/sops/deploy_team_sops_ed25519"
SOPS_KEY_FILE="${SOPS_AGE_SSH_PRIVATE_KEY_FILE:-${DEFAULT_SOPS_KEY}}"
DECRYPTED_SECRET_FILE="${BUILD_DIR}/runtime.env"
DIST_COMPOSE_FILE="${DIST_DIR}/docker-compose.yml"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-zemloveka_dev}"
JWT_SECRET="${JWT_SECRET:-zemloveka-dev-secret-change-in-prod}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-}"
APP_URL="${APP_URL:-http://localhost:4030}"
NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:4030}"
GEMINI_API_BASE_URL="${GEMINI_API_BASE_URL:-https://generativelanguage.googleapis.com/v1beta}"
GEMINI_TEXT_MODEL="${GEMINI_TEXT_MODEL:-gemini-3-flash-preview}"
GEMINI_CHAT_MODEL="${GEMINI_CHAT_MODEL:-gemini-3-flash-preview}"
GEMINI_ONBOARDING_MODEL="${GEMINI_ONBOARDING_MODEL:-gemini-3-flash-preview}"
GEMINI_LIVE_MODEL="${GEMINI_LIVE_MODEL:-gemini-2.5-flash-native-audio-preview-12-2025}"
GEMINI_LIVE_API_BASE_URL="${GEMINI_LIVE_API_BASE_URL:-https://generativelanguage.googleapis.com/v1alpha}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

yaml_quote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/''/g")"
}

read_env_file() {
  local env_file="$1"
  while IFS='=' read -r key value; do
    [[ -z "${key}" ]] && continue
    if [[ "${key}" =~ ^[[:space:]]*# ]]; then
      continue
    fi
    printf '%s=%s\n' "${key}" "${value}"
  done < "${env_file}"
}

require_cmd docker
require_cmd sops

mkdir -p "${BUILD_DIR}" "${DIST_DIR}"
find "${BUILD_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
find "${DIST_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
mkdir -p "${DB_CONTEXT_DIR}"

cp "${ROOT_DIR}/schema.sql" "${DB_CONTEXT_DIR}/01-schema.sql"
cp "${ROOT_DIR}/seed.sql" "${DB_CONTEXT_DIR}/02-seed.sql"

cat > "${DB_CONTEXT_DIR}/Dockerfile" <<'EOF'
FROM postgres:16-alpine

COPY 01-schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY 02-seed.sql /docker-entrypoint-initdb.d/02-seed.sql
EOF

if [[ -f "${SOPS_KEY_FILE}" ]]; then
  export SOPS_AGE_SSH_PRIVATE_KEY_FILE="${SOPS_KEY_FILE}"
fi

sops -d --input-type dotenv --output-type dotenv \
  "${ROOT_DIR}/secrets/runtime.env.sops" > "${DECRYPTED_SECRET_FILE}"
mapfile -t DECRYPTED_ENV_LINES < <(read_env_file "${DECRYPTED_SECRET_FILE}")

cat > "${DIST_COMPOSE_FILE}" <<EOF
services:
  db:
    image: ${DB_IMAGE}
    restart: unless-stopped
    environment:
      POSTGRES_DB: $(yaml_quote "zemloveka")
      POSTGRES_USER: $(yaml_quote "zemloveka")
      POSTGRES_PASSWORD: $(yaml_quote "${POSTGRES_PASSWORD}")
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zemloveka -d zemloveka"]
      interval: 5s
      timeout: 5s
      retries: 10

  frontend:
    image: ${FRONTEND_IMAGE}
    restart: unless-stopped
    ports:
      - "4030:4030"
    environment:
      DATABASE_URL: $(yaml_quote "postgresql://zemloveka:${POSTGRES_PASSWORD}@db:5432/zemloveka")
      JWT_SECRET: $(yaml_quote "${JWT_SECRET}")
      GOOGLE_CLIENT_ID: $(yaml_quote "${GOOGLE_CLIENT_ID}")
      GOOGLE_CLIENT_SECRET: $(yaml_quote "${GOOGLE_CLIENT_SECRET}")
      APP_URL: $(yaml_quote "${APP_URL}")
      NEXTAUTH_URL: $(yaml_quote "${NEXTAUTH_URL}")
      GEMINI_API_BASE_URL: $(yaml_quote "${GEMINI_API_BASE_URL}")
      GEMINI_TEXT_MODEL: $(yaml_quote "${GEMINI_TEXT_MODEL}")
      GEMINI_CHAT_MODEL: $(yaml_quote "${GEMINI_CHAT_MODEL}")
      GEMINI_ONBOARDING_MODEL: $(yaml_quote "${GEMINI_ONBOARDING_MODEL}")
      GEMINI_LIVE_MODEL: $(yaml_quote "${GEMINI_LIVE_MODEL}")
      GEMINI_LIVE_API_BASE_URL: $(yaml_quote "${GEMINI_LIVE_API_BASE_URL}")
      NODE_ENV: $(yaml_quote "production")
EOF

for line in "${DECRYPTED_ENV_LINES[@]}"; do
  key="${line%%=*}"
  value="${line#*=}"
  printf '      %s: %s\n' "${key}" "$(yaml_quote "${value}")" >> "${DIST_COMPOSE_FILE}"
done

cat >> "${DIST_COMPOSE_FILE}" <<EOF
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
EOF

docker build -t "${FRONTEND_IMAGE}" "${ROOT_DIR}"
docker build -t "${DB_IMAGE}" "${DB_CONTEXT_DIR}"

docker save -o "${DIST_DIR}/${FRONTEND_IMAGE_REPO}.tar" "${FRONTEND_IMAGE}"
docker save -o "${DIST_DIR}/${DB_IMAGE_REPO}.tar" "${DB_IMAGE}"

echo "Created distribution in ${DIST_DIR}"
