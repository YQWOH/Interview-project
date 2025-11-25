#!/bin/bash

# ==============================================
# Generate Secure Credentials for Production
# ==============================================
# This script generates strong random passwords and secrets
# for your production environment

echo "=========================================="
echo "Generating Secure Credentials"
echo "=========================================="
echo ""

echo "📝 Copy these values to your .env.production file:"
echo ""

echo "# MongoDB Root Password (32 characters)"
echo "MONGO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)"
echo ""

echo "# JWT Secret (64 characters hex)"
echo "JWT_SECRET=$(openssl rand -hex 64)"
echo ""

echo "# Mongo Express Password (32 characters)"
echo "MONGO_EXPRESS_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)"
echo ""

echo "=========================================="
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "=========================================="
echo "1. Store these credentials securely (password manager, secrets vault)"
echo "2. NEVER commit .env.production to git"
echo "3. Use different credentials for each environment"
echo "4. Rotate credentials regularly"
echo "5. Consider disabling Mongo Express in production"
echo ""
