#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RECIPIENTS_DIR="${ROOT_DIR}/scripts/secrets/recipients"
OUT_FILE="${RECIPIENTS_DIR}/github-team.keys"

TEAM_USERS=(
  "grantfanian"
  "projektant-pata"
  "johniccc"
)

mkdir -p "${RECIPIENTS_DIR}"

TMP_FILE="$(mktemp)"
trap 'rm -f "${TMP_FILE}"' EXIT

for user in "${TEAM_USERS[@]}"; do
  key_lines="$(curl -fsSL "https://github.com/${user}.keys" || true)"
  if [[ -z "${key_lines}" ]]; then
    echo "No SSH keys found for GitHub user: ${user}" >&2
    exit 1
  fi

  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    case "${line}" in
      ssh-ed25519\ *|ssh-rsa\ *)
        printf '%s\n' "${line}" >> "${TMP_FILE}"
        ;;
      *)
        ;;
    esac
  done <<< "${key_lines}"
done

if [[ ! -s "${TMP_FILE}" ]]; then
  echo "No supported SSH recipients found from GitHub profiles." >&2
  exit 1
fi

sort -u "${TMP_FILE}" > "${OUT_FILE}"
echo "Updated recipients: ${OUT_FILE}"
