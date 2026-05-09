#!/bin/bash

# Script para ejecutar los emails de confirmación bajo demanda
# Uso: ./trigger-emails.sh

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: La variable CRON_SECRET no está configurada"
  echo "Ejecuta: export CRON_SECRET='tu-secret'"
  exit 1
fi

if [ -z "$1" ]; then
  echo "❌ Error: Falta la URL del dominio"
  echo "Uso: ./trigger-emails.sh https://tu-dominio.com"
  exit 1
fi

SITE_URL=$1

echo "🚀 Ejecutando envío de emails..."

curl -X POST "$SITE_URL/api/email/send" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -s | jq .

echo ""
echo "✅ Petición completada"
