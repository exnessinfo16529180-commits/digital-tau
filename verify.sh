#!/bin/bash
# Quick verification script for Digital TAU application
# Run this script to quickly verify all components are working

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Digital TAU - Quick Verification Script                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Check if Docker is running
echo "🔍 Checking Docker..."
docker --version > /dev/null 2>&1
print_status $? "Docker is installed"

# Check if containers are running
echo ""
echo "🐳 Checking containers..."
docker compose ps | grep -q "dt_db.*Up"
print_status $? "Database container is running"

docker compose ps | grep -q "dt_api.*Up"
print_status $? "API container is running"

# Test database connection
echo ""
echo "💾 Testing database..."
docker exec dt_db psql -U dt_user -d dt_db -c "SELECT 1;" > /dev/null 2>&1
print_status $? "Database connection works"

# Test API endpoints
echo ""
echo "🌐 Testing API endpoints..."

# Health check
response=$(curl -s http://localhost:8000/health)
if echo "$response" | grep -q '"status":"ok"'; then
    print_status 0 "Health endpoint: /health"
else
    print_status 1 "Health endpoint failed"
fi

# Stats
response=$(curl -s http://localhost:8000/api/stats)
if echo "$response" | grep -q '"projects"'; then
    print_status 0 "Stats endpoint: /api/stats"
else
    print_status 1 "Stats endpoint failed"
fi

# Projects
curl -s http://localhost:8000/api/projects > /dev/null 2>&1
print_status $? "Projects endpoint: /api/projects"

# Categories
response=$(curl -s http://localhost:8000/api/categories)
if echo "$response" | grep -q '"code":"web"'; then
    print_status 0 "Categories endpoint: /api/categories"
else
    print_status 1 "Categories endpoint failed"
fi

# Technologies
curl -s http://localhost:8000/api/technologies > /dev/null 2>&1
print_status $? "Technologies endpoint: /api/technologies"

# Admin
echo ""
echo "🔐 Testing admin system..."
response=$(curl -s http://localhost:8000/api/admin/login)
if echo "$response" | grep -q "Admin login"; then
    print_status 0 "Admin login page accessible"
else
    print_status 1 "Admin login page failed"
fi

response=$(curl -s http://localhost:8000/api/admin/me)
if echo "$response" | grep -q '"loggedIn"'; then
    print_status 0 "Admin auth status endpoint"
else
    print_status 1 "Admin auth status failed"
fi

# Database data check
echo ""
echo "📊 Checking database data..."
count=$(docker exec dt_db psql -U dt_user -d dt_db -t -c "SELECT COUNT(*) FROM categories;")
if [ "$count" -ge 5 ]; then
    print_status 0 "Categories populated (count: $count)"
else
    print_status 1 "Categories not properly initialized"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION SUMMARY                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Components status:"
echo "  • PostgreSQL 16:    ✅ Running on port 5432"
echo "  • FastAPI Backend:  ✅ Running on port 8000"
echo "  • Database Schema:  ✅ Initialized"
echo "  • API Endpoints:    ✅ All responding"
echo "  • Admin System:     ✅ Accessible"
echo ""
echo "Quick links:"
echo "  • API Health:       http://localhost:8000/health"
echo "  • API Stats:        http://localhost:8000/api/stats"
echo "  • API Projects:     http://localhost:8000/api/projects"
echo "  • Admin Login:      http://localhost:8000/api/admin/login"
echo ""
echo "Default admin credentials:"
echo "  • Username: admin"
echo "  • Password: admin123"
echo ""
echo -e "${YELLOW}📖 For detailed verification, see VERIFICATION_GUIDE.md${NC}"
echo ""
