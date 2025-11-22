# Environment Variables Setup Guide

## ⚠️ IMPORTANT: Security First

**NEVER commit your `.env` file to Git!** It contains sensitive credentials.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   ```bash
   nano .env  # or use your preferred editor
   ```

3. Verify `.env` is in `.gitignore`:
   ```bash
   git check-ignore .env
   # Should output: .env
   ```

## Required Variables

### Database
```env
DB_PASSWORD=your_secure_database_password_here
```

### JWT Secret
```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
```
**Important:** Use a strong, random string (minimum 32 characters)

### Groq API (for Llama AI)
```env
GROQ_API_KEY=your_groq_api_key_here
```
Get your key from: https://console.groq.com/

### MailerSend Configuration

**CRITICAL:** The email domain must be verified in MailerSend!

1. Log in to [MailerSend Dashboard](https://app.mailersend.com/)
2. Go to **Domains** → **Add Domain**
3. Verify your domain (add DNS records)
4. Once verified, use an email from that domain:

```env
MAILERSEND_API_TOKEN=your_mailersend_api_token_here
MAILERSEND_FROM_EMAIL=noreply@your-verified-domain.com
MAILERSEND_FROM_NAME=SkillPilot AI
```

**Common Error:** `The from.email domain must be verified in your account`
**Solution:** Use an email address from a domain you've verified in MailerSend

### Admin User
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password_here
```

## Docker Compose

The `docker-compose.yml` automatically loads variables from `.env` file.

Make sure `.env` exists in the project root before running:
```bash
docker compose up -d
```

## Verification

After setting up `.env`, verify it's working:

```bash
# Check if variables are loaded (don't run this in production!)
docker compose config | grep -E "DB_PASSWORD|JWT_SECRET|GROQ_API_KEY"
```

## Troubleshooting

### MailerSend Domain Error
**Error:** `The from.email domain must be verified in your account #MS42207`

**Solution:**
1. Go to MailerSend Dashboard → Domains
2. Verify your domain (add TXT/DNS records)
3. Wait for verification (usually a few minutes)
4. Use an email from the verified domain in `MAILERSEND_FROM_EMAIL`

### Missing Environment Variables
If you see errors about missing variables:
1. Check `.env` file exists
2. Verify all required variables are set
3. Restart Docker containers: `docker compose restart`

## Security Checklist

- [ ] `.env` file exists and is configured
- [ ] `.env` is in `.gitignore` (check with `git check-ignore .env`)
- [ ] All passwords are strong and unique
- [ ] MailerSend domain is verified
- [ ] No credentials in `docker-compose.yml`
- [ ] No credentials in code files
- [ ] `.env` is never committed to Git

