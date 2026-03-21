#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
TMP_FILE="$(mktemp)"
OUT_FILE="${ROOT_DIR}/secrets/runtime.env.sops"

KEY_NAME="${1:-GEMINI_API_KEY}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}" >&2
  exit 1
fi

if [[ ! -f "${ROOT_DIR}/.sops.yaml" ]]; then
  echo "Missing ${ROOT_DIR}/.sops.yaml. Run render_sops_config.sh first." >&2
  exit 1
fi

export ENV_FILE KEY_NAME TMP_FILE
python - <<'PY'
import os

env_file = os.environ['ENV_FILE']
key_name = os.environ['KEY_NAME']
tmp_file = os.environ['TMP_FILE']

value = None
with open(env_file, 'r', encoding='utf-8') as f:
    for raw in f:
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        key, val = line.split('=', 1)
        if key.strip() == key_name:
            value = val.strip()
            break

if value is None:
    raise SystemExit(f"Missing {key_name} in {env_file}")

if len(value) >= 2 and ((value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'"))):
    value = value[1:-1]

with open(tmp_file, 'w', encoding='utf-8') as out:
    out.write(f"{key_name}={value}\n")
PY

mkdir -p "${ROOT_DIR}/secrets"
sops --encrypt \
  --filename-override "secrets/runtime.env.sops" \
  --input-type dotenv \
  --output-type dotenv \
  "${TMP_FILE}" > "${OUT_FILE}"
rm -f "${TMP_FILE}"

echo "Encrypted ${KEY_NAME} to ${OUT_FILE}"
