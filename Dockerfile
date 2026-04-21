FROM php:8.2-cli-bookworm

WORKDIR /app

COPY . .

RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    unzip \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN composer install --no-dev --optimize-autoloader

RUN chmod +x /app/docker/start.sh

CMD ["/app/docker/start.sh"]
