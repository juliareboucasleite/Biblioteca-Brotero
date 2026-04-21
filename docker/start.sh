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

# Evita configuração local (localhost) a rebentar no Render.
DB_CONNECTION="${DB_CONNECTION:-mysql}"
DB_HOST="${DB_HOST:-127.0.0.1}"

if [ "$DB_CONNECTION" = "mysql" ] && { [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; }; then
  echo "Configuração inválida no Render: DB_CONNECTION=mysql com DB_HOST=$DB_HOST." >&2
  echo "No Render, o MySQL NÃO está no próprio container. Aponte DB_HOST para o host do seu MySQL (externo) ou use Postgres do Render (DB_CONNECTION=pgsql)." >&2
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

