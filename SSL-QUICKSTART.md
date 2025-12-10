# SSL Configuration - Quick Start Guide

Quick reference for setting up SSL/HTTPS in Triply.

## 🚀 Local Development (HTTPS)

### Using mkcert (Recommended)

```bash
# 1. Install mkcert
brew install mkcert
brew install nss  # for Firefox

# 2. Run setup script
bash scripts/setup-local-ssl.sh

# 3. Start server
npm start

# 4. Access via HTTPS
open https://localhost:3443
```

**What the script does:**
- Installs local Certificate Authority
- Generates trusted SSL certificates
- Updates .env with SSL configuration
- No browser warnings!

### Manual Self-Signed Certificates

```bash
# Generate self-signed certificates
bash scripts/setup-local-ssl.sh --self-signed

# Note: Browser will show security warnings
# You'll need to manually accept the certificate
```

---

## 🌐 Production (HTTPS with Let's Encrypt)

### Prerequisites
- Domain name (e.g., triply.com)
- Server with ports 80 and 443 open
- Root/sudo access

### Quick Setup

```bash
# 1. Stop your application (Certbot needs port 80)
sudo systemctl stop triply
# OR
pm2 stop triply

# 2. Run setup script
sudo bash scripts/setup-production-ssl.sh yourdomain.com www.yourdomain.com

# 3. Follow prompts (enter email for notifications)

# 4. Start your application
sudo systemctl start triply
# OR
pm2 start triply
```

**What the script does:**
- Installs Certbot
- Generates SSL certificate (valid 90 days)
- Sets up auto-renewal
- Updates .env for production
- Configures HTTPS redirect
- Enables HSTS security

---

## ⚙️ Manual Configuration

### .env Settings

**Local Development:**
```env
SSL_ENABLED=true
SSL_KEY_PATH=./ssl/local/localhost-key.pem
SSL_CERT_PATH=./ssl/local/localhost-cert.pem
HTTPS_PORT=3443
FORCE_HTTPS=false
COOKIE_SECURE=false
```

**Production:**
```env
NODE_ENV=production
SSL_ENABLED=true
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
PORT=80
HTTPS_PORT=443
FORCE_HTTPS=true
HSTS_ENABLED=true
COOKIE_SECURE=true
APP_URL=https://yourdomain.com
```

---

## 🔍 Testing

### Local Testing
```bash
# Start server
npm start

# Test HTTPS
curl -k https://localhost:3443

# Browser
open https://localhost:3443
```

### Production Testing
```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443

# Check expiry
echo | openssl s_client -servername yourdomain.com \
  -connect yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Browser test
open https://yourdomain.com

# SSL Labs comprehensive test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

---

## 🔧 Troubleshooting

### "Certificate not trusted" (Local)
```bash
# Reinstall mkcert CA
mkcert -install

# Regenerate certificates
bash scripts/setup-local-ssl.sh
```

### "Permission denied" (Production)
```bash
# Fix certificate permissions
sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Or use the script (copies to app directory)
sudo bash scripts/setup-production-ssl.sh yourdomain.com
```

### Port 80/443 already in use
```bash
# Find what's using the port
sudo lsof -i :443

# Stop the service
sudo systemctl stop nginx  # or apache2
```

### Auto-renewal not working
```bash
# Test renewal
sudo certbot renew --dry-run

# Check timer status
sudo systemctl status certbot.timer

# Manual renewal
sudo certbot renew
```

---

## 📚 Additional Resources

- **Full Documentation**: [docs/SSL-SETUP.md](./SSL-SETUP.md)
- **Let's Encrypt**: https://letsencrypt.org/
- **mkcert**: https://github.com/FiloSottile/mkcert
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/

---

## 🔐 Security Checklist

**Local Development:**
- [ ] mkcert CA installed
- [ ] Certificates generated
- [ ] SSL_ENABLED=true in .env
- [ ] Server starts on HTTPS port

**Production:**
- [ ] Domain points to server
- [ ] Ports 80 and 443 open
- [ ] SSL certificate generated
- [ ] Auto-renewal enabled
- [ ] FORCE_HTTPS=true
- [ ] HSTS_ENABLED=true
- [ ] COOKIE_SECURE=true
- [ ] SSL Labs test passed (Grade A)

---

## 💡 Pro Tips

1. **Use HTTPS in development** - Match production environment
2. **Test certificate renewal** - `sudo certbot renew --dry-run`
3. **Monitor expiry** - Set up alerts 30 days before expiry
4. **Keep backups** - Store certificate backups securely
5. **Use Cloudflare** - Free SSL + CDN + DDoS protection

---

Need help? Check the full documentation in `docs/SSL-SETUP.md`
