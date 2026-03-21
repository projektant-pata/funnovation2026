# SOPS tymovy secret flow

Tento repozitar pouziva `sops` + SSH recipienty pro sifrovane dotenv secrety.

## Bootstrap jednim prikazem

Z rootu repozitare:

```bash
./scripts/secrets/bootstrap_sops.sh GEMINI_API_KEY
```

Tento prikaz:

1. Nacte SSH public klice pro:
   - `grantfanian`
   - `projektant-pata`
   - `johniccc`
2. Vygeneruje dedikovany deployment SSH keypair (jen na lokalnim stroji).
3. Vytvori `.sops.yaml` se vsemi recipienty.
4. Zasifruje vybrany klic z `.env` do `secrets/runtime.env.sops`.

## Soubory

- Tymovi recipienti: `scripts/secrets/recipients/github-team.keys`
- Deploy recipient (jen public): `scripts/secrets/recipients/deploy-team.pub`
- SOPS pravidla: `.sops.yaml`
- Sifrovany dotenv: `secrets/runtime.env.sops`

## Lokalni desifrovani

SOPS muze pouzit vychozi `~/.ssh/id_rsa` nebo vlastni SSH private klic.

Pokud tvuj private klic neni ve vychozi lokaci, nastav:

```bash
export SOPS_AGE_SSH_PRIVATE_KEY_FILE=/path/to/your/private_key
```

Pak desifruj:

```bash
sops -d --input-type dotenv --output-type dotenv secrets/runtime.env.sops
```

## Rotace

Pro obnoveni GitHub recipientu a znovuvygenerovani `.sops.yaml`:

```bash
./scripts/secrets/fetch_github_team_keys.sh
./scripts/secrets/render_sops_config.sh
sops updatekeys -y secrets/runtime.env.sops
```

Pro rotaci sifrovane hodnoty:

```bash
./scripts/secrets/encrypt_env_key.sh GEMINI_API_KEY
```
