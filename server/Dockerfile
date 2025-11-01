# Use official PHP 8.2 FPM image
FROM php:8.2-fpm

WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    nano \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer globally
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader

# Clear Laravel caches
RUN php artisan config:clear && php artisan route:clear && php artisan view:clear

# Fix permissions for Laravel writable directories
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 storage bootstrap/cache

# Ensure all public disk files are available at /public/storage
RUN mkdir -p public/storage && cp -r storage/app/public/* public/storage/ || true

# Expose the Laravel default port
EXPOSE 8000

# Run migrations and start the Laravel server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
