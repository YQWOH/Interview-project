#!/bin/bash

# Test Authentication Flow
echo "🔐 Testing JWT Authentication Flow"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Register a new user
echo -e "${BLUE}1. Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123",
    "name": "Demo User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
echo -e "${GREEN}✓ User registered${NC}"
echo ""

# 2. Login with the user
echo -e "${BLUE}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo -e "${GREEN}✓ Login successful${NC}"
echo ""

# 3. Get current user (protected route)
echo -e "${BLUE}3. Getting current user (protected route)...${NC}"
ME_RESPONSE=$(curl -s -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Protected route accessed${NC}"
echo ""

# 4. Try accessing without token (should fail)
echo -e "${BLUE}4. Trying to access without token (should fail)...${NC}"
NO_AUTH_RESPONSE=$(curl -s -X GET http://localhost:5000/api/auth/me)

echo "$NO_AUTH_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Unauthorized access blocked${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}✅ Authentication flow tested successfully!${NC}"
echo ""
echo "Your JWT Token:"
echo "$TOKEN"
