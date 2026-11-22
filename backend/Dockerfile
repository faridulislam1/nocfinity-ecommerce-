FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libsqlite3-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev

EXPOSE 8000
CMD sh -c "mkdir -p database storage/logs storage/framework/views storage/framework/cache storage/framework/sessions && touch database/database.sqlite && if [ -z \"$APP_KEY\" ]; then php artisan key:generate --force; fi && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"


