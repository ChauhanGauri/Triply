#!/bin/bash

# Setup Production SSL Certificates with Let's Encrypt
# This script automates SSL certificate generation for production

set -e

echo "🔐 Production SSL Setup with Let's Encrypt"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Get domain name
if [ -z "$1" ]; then
    echo -e "${RED}❌ Domain name required${NC}"
    echo ""
    echo "Usage: sudo bash scripts/setup-production-ssl.sh yourdomain.com [www.yourdomain.com]"
    echo ""
    echo "Example:"
    echo "  sudo bash scripts/setup-production-ssl.sh triply.com www.triply.com"
    exit 1
fi

DOMAIN=$1
WWW_DOMAIN=$2
EMAIL=""

# Get email for Let's Encrypt notifications
read -p "Enter email address for SSL certificate notifications: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email address required${NC}"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
if [ ! -z "$WWW_DOMAIN" ]; then
    echo "   WWW Domain: $WWW_DOMAIN"
fi
echo "   Email: $EMAIL"
echo ""

# Confirm
read -p "Continue with SSL setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    
    # Detect OS
    if [ -f /etc/debian_version ]; then
        apt-get update
        apt-get install -y certbot
    elif [ -f /etc/redhat-release ]; then
        yum install -y certbot
    else
        echo -e "${RED}❌ Unsupported OS. Please install Certbot manually.${NC}"
        exit 1
    fi
    
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

# Check if ports 80 and 443 are available
echo ""
echo "🔍 Checking ports..."

if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 80 is in use${NC}"
    echo "Certbot needs port 80 temporarily. Stop your application first:"
    echo "  sudo systemctl stop triply"
    echo "  OR"
    echo "  pm2 stop triply"
    exit 1
fi

if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 443 is in use${NC}"
    echo "Stop services using port 443 before continuing."
    exit 1
fi

echo "✅ Ports 80 and 443 are available"

# Generate certificate
echo ""
echo "🔑 Generating SSL certificate..."

if [ ! -z "$WWW_DOMAIN" ]; then
    certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL"
else
    certbot certonly --standalone \
        -d "$DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate generated successfully!${NC}"
else
    echo -e "${RED}❌ Failed to generate SSL certificate${NC}"
    exit 1
fi

# Certificate paths
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/$DOMAIN/privkey.pem"

echo ""
echo "📄 Certificate files:"
echo "   Certificate: $CERT_PATH"
echo "   Private Key: $KEY_PATH"

# Set up auto-renewal
echo ""
echo "⏰ Setting up automatic renewal..."

# Test renewal
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✅ Auto-renewal test successful"
else
    echo -e "${YELLOW}⚠️  Auto-renewal test failed. Check Certbot configuration.${NC}"
fi

# Check if systemd timer exists
if systemctl is-active --quiet certbot.timer; then
    echo "✅ Certbot timer is active (auto-renewal enabled)"
else
    echo -e "${YELLOW}⚠️  Certbot timer not found. Setting up cron job...${NC}"
    
    # Add cron job for renewal
    CRON_CMD="0 2 * * * certbot renew --quiet --post-hook 'systemctl restart triply || pm2 restart triply'"
    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -
    echo "✅ Cron job added for daily renewal check at 2 AM"
fi

# Update .env file
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

echo ""
echo "📝 Updating .env file..."

if [ -f "$ENV_FILE" ]; then
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up existing .env file"
fi

# Function to update or add env variable
update_env() {
    local key=$1
    local value=$2
    local file=$3
    
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

# Create or update .env
touch "$ENV_FILE"

update_env "NODE_ENV" "production" "$ENV_FILE"
update_env "SSL_ENABLED" "true" "$ENV_FILE"
update_env "SSL_KEY_PATH" "$KEY_PATH" "$ENV_FILE"
update_env "SSL_CERT_PATH" "$CERT_PATH" "$ENV_FILE"
update_env "PORT" "80" "$ENV_FILE"
update_env "HTTPS_PORT" "443" "$ENV_FILE"
update_env "FORCE_HTTPS" "true" "$ENV_FILE"
update_env "HSTS_ENABLED" "true" "$ENV_FILE"
update_env "HSTS_MAX_AGE" "31536000" "$ENV_FILE"
update_env "COOKIE_SECURE" "true" "$ENV_FILE"
update_env "COOKIE_SAME_SITE" "strict" "$ENV_FILE"

# Update APP_URL
PROTOCOL="https"
if [ ! -z "$WWW_DOMAIN" ]; then
    update_env "APP_URL" "${PROTOCOL}://${WWW_DOMAIN}" "$ENV_FILE"
else
    update_env "APP_URL" "${PROTOCOL}://${DOMAIN}" "$ENV_FILE"
fi

echo "✅ Updated .env file with production SSL configuration"

# Fix permissions (if running app as non-root user)
echo ""
echo "🔒 Setting up permissions..."

# Get the app user (if exists)
APP_USER="${SUDO_USER:-triply}"

if id "$APP_USER" &>/dev/null; then
    # Option 1: Copy certificates to app directory
    SSL_APP_DIR="$PROJECT_DIR/ssl/production"
    mkdir -p "$SSL_APP_DIR"
    
    cp "$CERT_PATH" "$SSL_APP_DIR/fullchain.pem"
    cp "$KEY_PATH" "$SSL_APP_DIR/privkey.pem"
    
    chown -R "$APP_USER:$APP_USER" "$SSL_APP_DIR"
    chmod 644 "$SSL_APP_DIR/fullchain.pem"
    chmod 600 "$SSL_APP_DIR/privkey.pem"
    
    # Update .env to use app directory certificates
    update_env "SSL_KEY_PATH" "./ssl/production/privkey.pem" "$ENV_FILE"
    update_env "SSL_CERT_PATH" "./ssl/production/fullchain.pem" "$ENV_FILE"
    
    echo "✅ Certificates copied to app directory with proper permissions"
    
    # Set up post-renewal hook to copy certificates
    HOOK_SCRIPT="/etc/letsencrypt/renewal-hooks/post/copy-to-app.sh"
    mkdir -p /etc/letsencrypt/renewal-hooks/post
    
    cat > "$HOOK_SCRIPT" << EOF
#!/bin/bash
# Copy renewed certificates to app directory
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_APP_DIR/fullchain.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_APP_DIR/privkey.pem
chown $APP_USER:$APP_USER $SSL_APP_DIR/*.pem
chmod 644 $SSL_APP_DIR/fullchain.pem
chmod 600 $SSL_APP_DIR/privkey.pem
# Restart application
systemctl restart triply 2>/dev/null || pm2 restart triply 2>/dev/null || true
EOF
    
    chmod +x "$HOOK_SCRIPT"
    echo "✅ Set up post-renewal hook for automatic certificate updates"
else
    echo -e "${YELLOW}⚠️  User '$APP_USER' not found${NC}"
    echo "Make sure your application has read permissions for certificate files"
fi

# Display summary
echo ""
echo "==========================================="
echo -e "${GREEN}🎉 SSL Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "📋 Configuration Summary:"
echo "   Domain: $DOMAIN"
if [ ! -z "$WWW_DOMAIN" ]; then
    echo "   WWW Domain: $WWW_DOMAIN"
fi
echo "   Certificate: $CERT_PATH"
echo "   Private Key: $KEY_PATH"
echo "   Valid for: 90 days"
echo "   Auto-renewal: Enabled"
echo ""
echo "📝 Updated .env:"
echo "   NODE_ENV=production"
echo "   SSL_ENABLED=true"
echo "   HTTPS_PORT=443"
echo "   FORCE_HTTPS=true"
echo ""
echo "🚀 Next Steps:"
echo "   1. Review .env file: nano .env"
echo "   2. Start your application:"
if command -v systemctl &> /dev/null; then
    echo "      sudo systemctl start triply"
elif command -v pm2 &> /dev/null; then
    echo "      pm2 start app.js --name triply"
else
    echo "      npm start"
fi
echo "   3. Test HTTPS: https://$DOMAIN"
echo "   4. Test HTTP redirect: http://$DOMAIN (should redirect to HTTPS)"
echo ""
echo "🔍 Verify SSL:"
echo "   - Browser: https://$DOMAIN (check padlock icon)"
echo "   - SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "   - Command: openssl s_client -connect $DOMAIN:443"
echo ""
echo "📚 Documentation: docs/SSL-SETUP.md"
echo ""
echo "⚠️  Important Notes:"
echo "   - Certificates expire in 90 days but auto-renew"
echo "   - Monitor renewal: sudo certbot renew --dry-run"
echo "   - Check logs: sudo journalctl -u certbot.timer"
echo ""
