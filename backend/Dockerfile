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

# Ensure .env exists and generate production app key
RUN cp .env.example .env
RUN composer install --no-interaction --optimize-autoloader --no-dev
RUN php artisan key:generate --force

# Setup sqlite storage and permissions
RUN mkdir -p database storage/logs storage/framework/views storage/framework/cache storage/framework/sessions
RUN touch database/database.sqlite
RUN chmod -R 777 storage bootstrap/cache database

EXPOSE 8000
CMD sh -c "touch database/database.sqlite && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"
