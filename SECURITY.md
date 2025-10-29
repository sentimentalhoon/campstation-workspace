# Security Guidelines

## 🔐 Secrets Management

### NEVER Commit These Files
- `.env`
- `.env.*` (any variant)
- `backend/.env`
- `frontend/.env.*`
- Any file containing passwords, API keys, or tokens

### How to Use Environment Variables

1. **Copy example files:**
   ```bash
   cp .env.example .env
   cp .env.prod.example .env.prod
   cp frontend/.env.example frontend/.env
   ```

2. **Fill in actual values** (DO NOT commit)

3. **Use Secrets Manager in production:**
   - AWS Secrets Manager
   - AWS Systems Manager Parameter Store
   - HashiCorp Vault

### Generated Secrets (DO NOT USE THESE IN PRODUCTION!)

These are example secure random values. Generate your own:

#### Database Password (32+ characters):
```bash
# Generate on Linux/Mac:
openssl rand -base64 32

# Generate on Windows PowerShell:
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Example output: `F1tpM76EB+Bv0E2sA/axb0AYw92bT7W65WwWdRkO4ms=`

#### JWT Secret (64+ bytes for HS512):
```bash
# Generate on Linux/Mac:
openssl rand -base64 64

# Generate on Windows PowerShell:
[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Example output: `7Uv2Sas+Etqf3FrxdWkRxZ0/3LKOEeRTAPPJq5NmBNReKVln8IMNLxe/uXQKoadk5EGTKYy7CsQl01PkaaWj+w==`

## 🚨 Emergency: Credentials Exposed

If you accidentally committed secrets to Git:

1. **Immediately revoke/rotate the credentials:**
   - AWS: IAM Console → Users → Security credentials → Deactivate
   - Database: Change password immediately
   - JWT: Regenerate secret (invalidates all tokens)

2. **Remove from Git history:**
   ```bash
   # Use BFG Repo-Cleaner
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive

   # Force push (WARNING: Coordinate with team)
   git push origin --force --all
   ```

3. **Add to .gitignore:**
   Already configured in `.gitignore`

## 🔒 AWS IAM Best Practices

### For Production (ECS):
- **Use IAM Roles** attached to ECS Tasks
- DO NOT use Access Keys
- Configure in Terraform:
  ```hcl
  resource "aws_iam_role" "ecs_task_role" {
    name = "campstation-ecs-task-role"
    # ... attach S3 access policy
  }
  ```

### For Development:
- Use Access Keys with **minimum permissions**
- Rotate keys every 90 days
- Never commit to Git

## 📋 Security Checklist

- [ ] All `.env*` files in `.gitignore`
- [ ] Strong database password (32+ chars, random)
- [ ] Strong JWT secret (64+ bytes, random)
- [ ] AWS credentials rotated after exposure
- [ ] Git history cleaned of secrets
- [ ] Production uses IAM Roles, not Access Keys
- [ ] Secrets stored in AWS Secrets Manager
- [ ] Rate limiting enabled on all APIs
- [ ] Input validation on all endpoints
- [ ] CSRF protection enabled
- [ ] Security headers configured

## 📞 Contact

If you discover a security vulnerability, please email: security@campstation.com
