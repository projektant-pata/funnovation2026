# SOPS team secret flow

This repo uses `sops` + SSH recipients for encrypted dotenv secrets.

## One-command bootstrap

From repo root:

```bash
./scripts/secrets/bootstrap_sops.sh GEMINI_API_KEY
```

This will:

1. Fetch SSH public keys for:
   - `grantfanian`
   - `projektant-pata`
   - `johniccc`
2. Generate a dedicated deployment SSH keypair (local machine only).
3. Build `.sops.yaml` with all recipients.
4. Encrypt the selected key from `.env` into `secrets/runtime.env.sops`.

## Files

- Team recipients: `scripts/secrets/recipients/github-team.keys`
- Deploy recipient (public only): `scripts/secrets/recipients/deploy-team.pub`
- SOPS rules: `.sops.yaml`
- Encrypted dotenv: `secrets/runtime.env.sops`

## Decrypt locally

SOPS can use default `~/.ssh/id_rsa` or a custom SSH private key.

If your private key is not in the default location, set:

```bash
export SOPS_AGE_SSH_PRIVATE_KEY_FILE=/path/to/your/private_key
```

Then decrypt:

```bash
sops -d --input-type dotenv --output-type dotenv secrets/runtime.env.sops
```

## Rotation

To refresh GitHub recipients and re-render `.sops.yaml`:

```bash
./scripts/secrets/fetch_github_team_keys.sh
./scripts/secrets/render_sops_config.sh
sops updatekeys -y secrets/runtime.env.sops
```

To rotate encrypted value:

```bash
./scripts/secrets/encrypt_env_key.sh GEMINI_API_KEY
```
