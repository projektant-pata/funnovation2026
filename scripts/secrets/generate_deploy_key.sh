#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RECIPIENTS_DIR="${ROOT_DIR}/scripts/secrets/recipients"

KEY_PATH="${SOPS_DEPLOY_KEY_PATH:-${HOME}/.config/sops/deploy_team_sops_ed25519}"
PUB_PATH="${KEY_PATH}.pub"
DEPLOY_RECIPIENT_FILE="${RECIPIENTS_DIR}/deploy-team.pub"

mkdir -p "$(dirname "${KEY_PATH}")"
mkdir -p "${RECIPIENTS_DIR}"

if [[ -f "${KEY_PATH}" && -f "${PUB_PATH}" ]]; then
  echo "Deployment key already exists: ${KEY_PATH}"
else
  ssh-keygen -t ed25519 -N "" -C "deploy-team-sops" -f "${KEY_PATH}" >/dev/null
  chmod 600 "${KEY_PATH}"
  chmod 644 "${PUB_PATH}"
  echo "Generated deployment key: ${KEY_PATH}"
fi

cp "${PUB_PATH}" "${DEPLOY_RECIPIENT_FILE}"

echo "Saved deploy recipient: ${DEPLOY_RECIPIENT_FILE}"
echo "Deploy key fingerprint:"
ssh-keygen -lf "${PUB_PATH}"
echo
echo "Share the private key securely with deployment team only: ${KEY_PATH}"
