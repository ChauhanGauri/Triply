#!/bin/bash

# Setup Local SSL Certificates for Development
# This script generates SSL certificates for local HTTPS development

set -e

echo "🔐 Setting up Local SSL Certificates for Development"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSL_DIR="$PROJECT_DIR/ssl/local"

echo "📁 Project directory: $PROJECT_DIR"
echo "📁 SSL directory: $SSL_DIR"
echo ""

# Create SSL directory
mkdir -p "$SSL_DIR"
echo "✅ Created SSL directory"

# Check if mkcert is installed
if command -v mkcert &> /dev/null; then
    echo "✅ mkcert is already installed"
    
    # Check if local CA is installed
    if mkcert -install 2>&1 | grep -q "already"; then
        echo "✅ Local CA is already installed"
    else
        echo "📦 Installing local CA..."
        mkcert -install
        echo "✅ Local CA installed"
    fi
    
    # Generate certificates
    echo ""
    echo "🔑 Generating SSL certificates..."
    cd "$SSL_DIR"
    
    mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem localhost 127.0.0.1 ::1
    
    echo ""
    echo -e "${GREEN}✅ SSL certificates generated successfully!${NC}"
    echo ""
    echo "📄 Certificate files:"
    echo "   - Key: $SSL_DIR/localhost-key.pem"
    echo "   - Cert: $SSL_DIR/localhost-cert.pem"
    
else
    echo -e "${YELLOW}⚠️  mkcert is not installed${NC}"
    echo ""
    echo "Please install mkcert first:"
    echo ""
    
    # Detect OS and provide installation instructions
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS:"
        echo "  brew install mkcert"
        echo "  brew install nss  # for Firefox support"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux:"
        echo "  # Debian/Ubuntu"
        echo "  sudo apt install libnss3-tools"
        echo "  wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"
        echo "  chmod +x mkcert"
        echo "  sudo mv mkcert /usr/local/bin/"
    else
        echo "Windows:"
        echo "  choco install mkcert"
    fi
    
    echo ""
    echo "Alternative: Generate self-signed certificates"
    echo "  bash scripts/setup-local-ssl.sh --self-signed"
    echo ""
    
    # Offer self-signed option
    if [[ "$1" == "--self-signed" ]]; then
        echo ""
        echo "🔑 Generating self-signed certificates..."
        cd "$SSL_DIR"
        
        openssl genrsa -out localhost-key.pem 2048
        
        openssl req -new -key localhost-key.pem -out localhost.csr \
            -subj "/C=US/ST=State/L=City/O=Triply/CN=localhost"
        
        openssl x509 -req -days 365 -in localhost.csr \
            -signkey localhost-key.pem -out localhost-cert.pem
        
        rm localhost.csr
        
        echo ""
        echo -e "${YELLOW}⚠️  Self-signed certificates generated${NC}"
        echo -e "${YELLOW}⚠️  Your browser will show security warnings${NC}"
        echo -e "${YELLOW}⚠️  You'll need to manually accept the certificate${NC}"
        echo ""
        echo "📄 Certificate files:"
        echo "   - Key: $SSL_DIR/localhost-key.pem"
        echo "   - Cert: $SSL_DIR/localhost-cert.pem"
    else
        exit 1
    fi
fi

# Update .env file
ENV_FILE="$PROJECT_DIR/.env"
echo ""
echo "📝 Updating .env file..."

# Create .env from .env.example if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
        echo "✅ Created .env from .env.example"
    else
        touch "$ENV_FILE"
        echo "✅ Created new .env file"
    fi
fi

# Function to update or add env variable
update_env() {
    local key=$1
    local value=$2
    local file=$3
    
    if grep -q "^${key}=" "$file"; then
        # Key exists, update it (macOS and Linux compatible)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$file"
        fi
    else
        # Key doesn't exist, add it
        echo "${key}=${value}" >> "$file"
    fi
}

# Update SSL configuration
update_env "SSL_ENABLED" "true" "$ENV_FILE"
update_env "SSL_KEY_PATH" "./ssl/local/localhost-key.pem" "$ENV_FILE"
update_env "SSL_CERT_PATH" "./ssl/local/localhost-cert.pem" "$ENV_FILE"
update_env "HTTPS_PORT" "3443" "$ENV_FILE"

echo "✅ Updated .env file with SSL configuration"

# Display summary
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 SSL Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo "   1. Start your server: npm start"
echo "   2. Access via HTTPS: https://localhost:3443"
echo "   3. Access via HTTP: http://localhost:3000 (will redirect if FORCE_HTTPS=true)"
echo ""
echo "⚙️  Configuration:"
echo "   - SSL_ENABLED=true"
echo "   - HTTPS_PORT=3443"
echo "   - Certificate files in: ssl/local/"
echo ""
echo "💡 Tips:"
echo "   - Use HTTPS URLs in development to match production"
echo "   - Configure Socket.io client to use wss:// for WebSocket"
echo "   - Set COOKIE_SECURE=false for local HTTP testing"
echo ""
echo "📚 Documentation: docs/SSL-SETUP.md"
echo ""
