# Security Policy

## Reporting a vulnerability

Please do not open public issues for vulnerabilities or leaked credentials.

If you find a security issue, contact the maintainer privately through GitHub profile contact options when available.

## Credential safety

Never commit Roblox API keys, account credentials, or private project secrets.

Use local environment variables for credentials. Example variable names that may be used in future versions:

```bash
ROBLOX_OPEN_CLOUD_API_KEY=
ROBLOX_UNIVERSE_ID=
```

## Scope

This project is intended to use official Roblox APIs where supported and should avoid unsupported endpoints or insecure credential handling.
