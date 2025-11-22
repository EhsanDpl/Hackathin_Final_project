# Security Guidelines

## ⚠️ CRITICAL: Never Commit Credentials

**NEVER commit the following to Git:**
- API keys (Groq, MailerSend, etc.)
- Database passwords
- JWT secrets
- Admin passwords
- Any production credentials

## Environment Variables

All sensitive configuration should be stored in `.env` file which is **gitignored**.

### Required Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

### Environment Variables List

- `DB_PASSWORD` - PostgreSQL database password
- `JWT_SECRET` - Secret key for JWT token signing (min 32 characters)
- `GROQ_API_KEY` - Groq API key for Llama AI
- `MAILERSEND_API_TOKEN` - MailerSend API token
- `MAILERSEND_FROM_EMAIL` - **Verified email domain** from MailerSend (e.g., noreply@yourdomain.com)
- `MAILERSEND_FROM_NAME` - Sender name (optional)
- `ADMIN_EMAIL` - Super admin email address
- `ADMIN_PASSWORD` - Super admin password

## MailerSend Domain Verification

**IMPORTANT:** The `MAILERSEND_FROM_EMAIL` domain must be verified in your MailerSend account.

1. Log in to [MailerSend Dashboard](https://app.mailersend.com/)
2. Go to **Domains** section
3. Add and verify your domain
4. Use an email from that verified domain in `MAILERSEND_FROM_EMAIL`

Example:
- If your verified domain is `example.com`
- Use: `MAILERSEND_FROM_EMAIL=noreply@example.com`

## GitGuardian Compliance

This repository is monitored by GitGuardian. If you accidentally commit credentials:

1. **Immediately** rotate/revoke the exposed credentials
2. Remove the credentials from Git history
3. Update `.env` file with new credentials
4. Never commit `.env` file

## Docker Compose

The `docker-compose.yml` uses environment variables from `.env` file. Never hardcode credentials in docker-compose.yml.

## Best Practices

1. ✅ Use `.env` file for all secrets
2. ✅ Keep `.env` in `.gitignore`
3. ✅ Use `.env.example` as a template
4. ✅ Rotate credentials if exposed
5. ✅ Use strong, unique passwords
6. ✅ Never share `.env` files
7. ✅ Review commits before pushing

## If Credentials Are Exposed

1. **Immediately** revoke/rotate the exposed credentials
2. Check GitGuardian alerts
3. Remove from Git history if needed
4. Update all systems with new credentials
5. Review access logs for unauthorized usage

