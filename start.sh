#!/bin/bash
# Quick start script for Digital TAU full site
# Скрипт быстрого запуска полного сайта Digital TAU

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Digital TAU - Запуск полного сайта                      ║"
echo "║   Full Site Quick Start                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "🔍 Проверка Docker..."
if ! docker --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker не установлен или не запущен${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker установлен${NC}"

# Check if docker-compose is available
if ! docker compose version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose не доступен${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose доступен${NC}"
echo ""

# Check if .env exists, create if not
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден. Создаём из .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Файл .env создан${NC}"
    else
        echo -e "${RED}❌ Файл .env.example не найден${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Файл .env существует${NC}"
fi
echo ""

# Stop any running containers
echo "🛑 Остановка существующих контейнеров..."
docker compose down > /dev/null 2>&1 || true
echo ""

# Start all services
echo "🚀 Запуск всех сервисов..."
echo -e "${BLUE}Это может занять 2-3 минуты при первом запуске...${NC}"
echo ""

docker compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов..."
echo ""

# Wait for services to be ready
for i in {1..60}; do
    echo -n "."
    sleep 1
    
    # Check if API is responding
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ API запущен и отвечает${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  API не отвечает после 60 секунд. Проверьте логи.${NC}"
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Статус контейнеров                                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
docker compose ps
echo ""

# Check container health
echo "🏥 Проверка здоровья сервисов..."
echo ""

# Check database
if docker compose ps | grep dt_db | grep -q "Up"; then
    echo -e "${GREEN}✅ PostgreSQL работает${NC}"
else
    echo -e "${RED}❌ PostgreSQL не запущен${NC}"
fi

# Check API
if docker compose ps | grep dt_api | grep -q "Up"; then
    echo -e "${GREEN}✅ Backend API работает${NC}"
else
    echo -e "${RED}❌ Backend API не запущен${NC}"
fi

# Check frontend
if docker compose ps | grep dt_frontend | grep -q "Up"; then
    echo -e "${GREEN}✅ Frontend работает${NC}"
    
    # Note about frontend
    echo -e "${YELLOW}   ⚠️  Frontend может всё ещё собираться. Проверьте логи:${NC}"
    echo -e "      docker compose logs -f frontend"
else
    echo -e "${RED}❌ Frontend не запущен${NC}"
fi

# Check nginx
if docker compose ps | grep dt_nginx | grep -q "Up"; then
    echo -e "${GREEN}✅ Nginx работает${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx не запущен (опционально)${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🌐 Доступные URL адреса                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check which services are accessible
if docker compose ps | grep dt_nginx | grep -q "Up"; then
    echo -e "${BLUE}📍 Полный сайт (через Nginx):${NC}"
    echo "   http://localhost"
    echo ""
fi

echo -e "${BLUE}📍 Backend API (прямой доступ):${NC}"
echo "   http://localhost:8000/health"
echo "   http://localhost:8000/api/stats"
echo "   http://localhost:8000/api/projects"
echo ""

echo -e "${BLUE}📍 Админ-панель (оригинальный интерфейс):${NC}"
echo "   http://localhost:8000/admin/login"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo ""

if docker compose ps | grep dt_frontend | grep -q "Up"; then
    echo -e "${BLUE}📍 Frontend (прямой доступ):${NC}"
    echo "   http://localhost:3000"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   📝 Полезные команды                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Просмотр логов всех сервисов:"
echo "  docker compose logs -f"
echo ""
echo "Просмотр логов отдельного сервиса:"
echo "  docker compose logs -f frontend"
echo "  docker compose logs -f api"
echo "  docker compose logs -f db"
echo ""
echo "Остановить все сервисы:"
echo "  docker compose down"
echo ""
echo "Перезапустить все сервисы:"
echo "  docker compose restart"
echo ""
echo "Автоматическая проверка:"
echo "  ./verify.sh"
echo ""

# Try to test API
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧪 Быстрый тест                                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test health endpoint
echo -n "Проверка API здоровья... "
if response=$(curl -s http://localhost:8000/health 2>/dev/null); then
    if echo "$response" | grep -q "ok"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Неожиданный ответ${NC}"
    fi
else
    echo -e "${RED}❌ Недоступен${NC}"
fi

# Test stats endpoint
echo -n "Проверка API статистики... "
if response=$(curl -s http://localhost:8000/api/stats 2>/dev/null); then
    if echo "$response" | grep -q "projects"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Неожиданный ответ${NC}"
    fi
else
    echo -e "${RED}❌ Недоступен${NC}"
fi

# Test admin login page
echo -n "Проверка админ-панели... "
if curl -s http://localhost:8000/admin/login 2>/dev/null | grep -q "Вход в админку"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Недоступна или не отвечает${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ Запуск завершён!                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Сайт запущен и готов к использованию!${NC}"
echo ""
echo -e "${BLUE}📖 Подробная инструкция:${NC} RUNNING_FULL_SITE.md"
echo -e "${BLUE}📋 Руководство по проверке:${NC} VERIFICATION_GUIDE.md"
echo ""

# Open browser if possible
if command -v xdg-open > /dev/null 2>&1; then
    echo -e "${YELLOW}Открыть сайт в браузере? (y/n)${NC}"
    read -r -n 1 response
    echo ""
    if [[ "$response" =~ ^[Yy]$ ]]; then
        if docker compose ps | grep dt_nginx | grep -q "Up"; then
            xdg-open http://localhost 2>/dev/null || true
        else
            xdg-open http://localhost:8000 2>/dev/null || true
        fi
    fi
fi
