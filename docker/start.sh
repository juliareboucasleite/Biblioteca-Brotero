#!/usr/bin/env sh
set -eu

cd /app

if [ -z "${PORT:-}" ]; then
  echo "PORT não definido (Render costuma definir automaticamente)." >&2
  exit 1
fi

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY não definido. Defina-o nas variáveis de ambiente (ex.: php artisan key:generate --show)." >&2
  exit 1
fi

# Symlink de storage (idempotente).
if [ ! -e "public/storage" ]; then
  php artisan storage:link || true
fi

# Migrações (produção).
php artisan migrate --force

# Caches para produção.
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

exec php artisan serve --host=0.0.0.0 --port="${PORT}"

