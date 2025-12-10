# SSL/HTTPS Setup Guide

This guide covers SSL/HTTPS configuration for both local development and production environments.

## Table of Contents
1. [Local Development HTTPS Setup](#local-development-https-setup)
2. [Production SSL Setup](#production-ssl-setup)
3. [Environment Configuration](#environment-configuration)
4. [Troubleshooting](#troubleshooting)

---

## Local Development HTTPS Setup

### Option 1: Using mkcert (Recommended for Local Development)

**mkcert** creates locally-trusted development certificates with zero configuration.

#### Installation

**macOS:**
```bash
brew install mkcert
brew install nss # for Firefox support
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

**Windows:**
```bash
choco install mkcert
```

#### Generate Local SSL Certificates

```bash
# Navigate to your project
cd /path/to/Triply

# Create certificates directory
mkdir -p ssl/local

# Install local CA
mkcert -install

# Generate certificate for localhost
mkcert -key-file ssl/local/localhost-key.pem -cert-file ssl/local/localhost-cert.pem localhost 127.0.0.1 ::1

echo "✅ Local SSL certificates generated!"
```

#### Update .env for Local Development

```env
# SSL Configuration (Local Development)
NODE_ENV=development
SSL_ENABLED=true
SSL_KEY_PATH=./ssl/local/localhost-key.pem
SSL_CERT_PATH=./ssl/local/localhost-cert.pem
PORT=3000
HTTPS_PORT=3443
```

---

### Option 2: Self-Signed Certificates (Manual)

If you can't use mkcert, generate self-signed certificates:

```bash
# Create certificates directory
mkdir -p ssl/local

# Generate private key
openssl genrsa -out ssl/local/localhost-key.pem 2048

# Generate certificate signing request
openssl req -new -key ssl/local/localhost-key.pem -out ssl/local/localhost.csr \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in ssl/local/localhost.csr \
  -signkey ssl/local/localhost-key.pem -out ssl/local/localhost-cert.pem

# Clean up CSR
rm ssl/local/localhost.csr

echo "✅ Self-signed certificates generated!"
```

**Note:** Self-signed certificates will show browser warnings. You'll need to manually accept them.

---

## Production SSL Setup

### Option 1: Let's Encrypt (Free, Automated, Recommended)

**Let's Encrypt** provides free SSL certificates with automatic renewal.

#### Prerequisites
- Domain name pointing to your server
- Server with open ports 80 and 443
- Root/sudo access

#### Installation (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# OR for standalone mode (if not using Nginx)
sudo apt install certbot -y
```

#### Generate SSL Certificate

**With Nginx:**
```bash
# Let Certbot automatically configure Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts to:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

**Standalone Mode (without Nginx):**
```bash
# Stop your Node.js app temporarily
sudo systemctl stop triply

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Restart your app
sudo systemctl start triply
```

#### Auto-Renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically creates a cron job
# Check if it exists:
sudo systemctl status certbot.timer

# Manual cron job (if needed):
sudo crontab -e

# Add this line to renew at 2 AM daily:
0 2 * * * certbot renew --quiet --post-hook "systemctl restart triply"
```

#### Update .env for Production

```env
# SSL Configuration (Production)
NODE_ENV=production
SSL_ENABLED=true
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
PORT=80
HTTPS_PORT=443
```

---

### Option 2: Commercial SSL Certificate

If you have a commercial SSL certificate from providers like DigiCert, GoDaddy, etc.:

1. **Purchase Certificate** from your provider
2. **Generate CSR** on your server:
   ```bash
   openssl req -new -newkey rsa:2048 -nodes \
     -keyout yourdomain.com.key -out yourdomain.com.csr
   ```
3. **Submit CSR** to your SSL provider
4. **Download Certificates** (usually: certificate, intermediate, root)
5. **Combine Certificates**:
   ```bash
   cat yourdomain.com.crt intermediate.crt > fullchain.pem
   ```
6. **Update .env**:
   ```env
   SSL_KEY_PATH=/path/to/yourdomain.com.key
   SSL_CERT_PATH=/path/to/fullchain.pem
   ```

---

### Option 3: Cloudflare SSL (Proxy Mode)

**Free SSL with Cloudflare as a proxy:**

1. **Add Site to Cloudflare**
   - Sign up at cloudflare.com
   - Add your domain
   - Update nameservers at your registrar

2. **Enable SSL**
   - Go to SSL/TLS → Overview
   - Select "Flexible" (Cloudflare to visitor HTTPS, origin HTTP)
   - Or "Full (strict)" if you have SSL on origin

3. **Edge Certificates**
   - Cloudflare provides automatic SSL certificates
   - Valid for your domain and subdomains

4. **Origin Certificate** (Optional, more secure):
   - SSL/TLS → Origin Server → Create Certificate
   - Download certificate and key
   - Install on your server

---

## Environment Configuration

### Complete .env Example

```env
# ======================
# Server Configuration
# ======================
NODE_ENV=production
PORT=80
HTTPS_PORT=443

# ======================
# SSL Configuration
# ======================
SSL_ENABLED=true
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem

# Force HTTPS redirect
FORCE_HTTPS=true

# HSTS (HTTP Strict Transport Security)
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000

# ======================
# Session Security
# ======================
SESSION_SECRET=your-super-secret-key-change-in-production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# ======================
# Database
# ======================
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/triply

# ======================
# Redis
# ======================
REDIS_URL=rediss://default:pass@redis-12345.cloud.redislabs.com:12345

# ======================
# Email
# ======================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Application Code Updates

### Update app.js for HTTPS Support

```javascript
// app.js
require("dotenv").config();
const express = require("express");
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// ... (existing middleware and configuration)

// SSL Configuration
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

let server;

if (SSL_ENABLED && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
    
    const credentials = {
      key: privateKey,
      cert: certificate
    };
    
    // Create HTTPS server
    server = https.createServer(credentials, app);
    
    // Optional: Create HTTP server that redirects to HTTPS
    if (process.env.FORCE_HTTPS === 'true') {
      const httpApp = express();
      httpApp.use((req, res) => {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      });
      http.createServer(httpApp).listen(PORT, () => {
        console.log(`🔀 HTTP redirect server running on port ${PORT}`);
      });
    }
    
    console.log('✅ SSL/HTTPS enabled');
  } catch (error) {
    console.error('❌ SSL certificate error:', error.message);
    console.log('⚠️  Falling back to HTTP');
    server = http.createServer(app);
  }
} else {
  // Create HTTP server
  server = http.createServer(app);
  console.log('ℹ️  Running in HTTP mode');
}

// Initialize Socket.io
const { initSocket } = require('./src/config/socket');
initSocket(server);

// Start server
const listenPort = SSL_ENABLED ? HTTPS_PORT : PORT;
server.listen(listenPort, () => {
  const protocol = SSL_ENABLED ? 'https' : 'http';
  console.log(`✅ Server running on ${protocol}://localhost:${listenPort}`);
});
```

### Update Session Configuration

```javascript
// Session configuration with secure cookies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true', // true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.COOKIE_SAME_SITE || 'lax'
  }
}));
```

### Add Security Headers Middleware

```javascript
// Security headers middleware
app.use((req, res, next) => {
  // HSTS (HTTP Strict Transport Security)
  if (process.env.HSTS_ENABLED === 'true') {
    const maxAge = process.env.HSTS_MAX_AGE || 31536000; // 1 year
    res.setHeader('Strict-Transport-Security', `max-age=${maxAge}; includeSubDomains; preload`);
  }
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
```

---

## Nginx Reverse Proxy Configuration (Optional)

If you're using Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/triply

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support for Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/triply /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Testing SSL Configuration

### Local Testing

```bash
# Start server with SSL
npm start

# Test HTTPS endpoint
curl -k https://localhost:3443

# Or open in browser
open https://localhost:3443
```

### Production Testing

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# SSL Labs test (comprehensive)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

### Browser Testing

1. Open your site in browser
2. Click the padlock icon in address bar
3. Check certificate details
4. Verify:
   - Certificate is valid
   - Issued by trusted CA
   - Covers your domain
   - Not expired

---

## Troubleshooting

### Common Issues

**1. "Certificate not trusted" warning**
- **Local Development**: Install mkcert CA or accept self-signed certificate
- **Production**: Ensure certificate chain is complete (includes intermediate certificates)

**2. "Mixed content" warnings**
- Ensure all resources (CSS, JS, images) use HTTPS
- Update hardcoded HTTP URLs to HTTPS or use protocol-relative URLs

**3. WebSocket connection fails**
- Update Socket.io client to use `wss://` instead of `ws://`
- Ensure proxy (if any) supports WebSocket upgrade

**4. Session/cookies not working**
- Set `cookie.secure: false` for local development without HTTPS
- Set `cookie.secure: true` only in production with HTTPS

**5. Certificate renewal fails**
- Check if ports 80/443 are accessible
- Ensure domain DNS is correctly configured
- Check Certbot logs: `sudo journalctl -u certbot`

**6. Permission denied reading certificate files**
```bash
# Fix permissions
sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Or run Node.js with appropriate permissions (not recommended)
# Better: Copy certificates to app directory with proper permissions
```

### File Permissions

```bash
# Certificates should be readable by the application user
# Option 1: Copy certificates (safer)
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/triply/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/triply/ssl/
sudo chown triply:triply /path/to/triply/ssl/*.pem
sudo chmod 644 /path/to/triply/ssl/fullchain.pem
sudo chmod 600 /path/to/triply/ssl/privkey.pem

# Option 2: Add application user to ssl-cert group
sudo usermod -a -G ssl-cert triply
sudo chgrp ssl-cert /etc/letsencrypt/live/yourdomain.com/privkey.pem
sudo chmod g+r /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Enable HSTS** to force HTTPS
3. **Use strong SSL/TLS protocols** (TLS 1.2+)
4. **Keep certificates up to date** (auto-renewal)
5. **Secure private keys** (proper file permissions)
6. **Use secure cookie settings** (`secure: true`, `httpOnly: true`)
7. **Implement CSP** (Content Security Policy)
8. **Regular security audits** (SSL Labs, etc.)

---

## Quick Start Commands

### Local Development
```bash
# Install mkcert
brew install mkcert

# Generate certificates
mkdir -p ssl/local
mkcert -install
mkcert -key-file ssl/local/localhost-key.pem -cert-file ssl/local/localhost-cert.pem localhost

# Update .env
echo "SSL_ENABLED=true" >> .env
echo "SSL_KEY_PATH=./ssl/local/localhost-key.pem" >> .env
echo "SSL_CERT_PATH=./ssl/local/localhost-cert.pem" >> .env
echo "HTTPS_PORT=3443" >> .env

# Start server
npm start
```

### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update .env
echo "NODE_ENV=production" >> .env
echo "SSL_ENABLED=true" >> .env
echo "SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem" >> .env
echo "SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem" >> .env
echo "HTTPS_PORT=443" >> .env
echo "COOKIE_SECURE=true" >> .env

# Start server
npm start
```

---

## Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Node.js HTTPS Documentation](https://nodejs.org/api/https.html)

---

**Need Help?** Check the troubleshooting section or refer to the documentation links above.
