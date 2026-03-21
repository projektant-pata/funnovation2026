#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RECIPIENTS_DIR="${ROOT_DIR}/scripts/secrets/recipients"
TEAM_FILE="${RECIPIENTS_DIR}/github-team.keys"
DEPLOY_FILE="${RECIPIENTS_DIR}/deploy-team.pub"
SOPS_CONFIG_FILE="${ROOT_DIR}/.sops.yaml"

if [[ ! -f "${TEAM_FILE}" ]]; then
  echo "Missing ${TEAM_FILE}. Run fetch_github_team_keys.sh first." >&2
  exit 1
fi

if [[ ! -f "${DEPLOY_FILE}" ]]; then
  echo "Missing ${DEPLOY_FILE}. Run generate_deploy_key.sh first." >&2
  exit 1
fi

RECIPIENTS="$({ cat "${TEAM_FILE}"; cat "${DEPLOY_FILE}"; } | sed '/^\s*$/d' | sort -u | paste -sd ',' -)"

if [[ -z "${RECIPIENTS}" ]]; then
  echo "No recipients found. Cannot generate ${SOPS_CONFIG_FILE}." >&2
  exit 1
fi

cat > "${SOPS_CONFIG_FILE}" <<EOF
creation_rules:
  - path_regex: ^secrets/.*\\.env\\.sops$
    age: ${RECIPIENTS}
EOF

echo "Rendered ${SOPS_CONFIG_FILE}"
