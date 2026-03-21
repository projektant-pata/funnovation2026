#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

"${ROOT_DIR}/scripts/secrets/fetch_github_team_keys.sh"
"${ROOT_DIR}/scripts/secrets/generate_deploy_key.sh"
"${ROOT_DIR}/scripts/secrets/render_sops_config.sh"
"${ROOT_DIR}/scripts/secrets/encrypt_env_key.sh" "${1:-GEMINI_API_KEY}"

echo
echo "SOPS bootstrap complete."
echo "- Recipients: ${ROOT_DIR}/scripts/secrets/recipients"
echo "- Config: ${ROOT_DIR}/.sops.yaml"
echo "- Encrypted secret: ${ROOT_DIR}/secrets/runtime.env.sops"
