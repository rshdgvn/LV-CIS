# Stage 1: Base PHP image
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
    nano \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer globally
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . .

# Install PHP dependencies (no dev)
RUN composer install --no-dev --optimize-autoloader

# Clear and optimize Laravel cache
RUN php artisan config:clear && php artisan route:clear && php artisan view:clear

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Create the storage symlink and ensure public access
RUN php artisan storage:link || true
RUN mkdir -p public/storage && cp -r storage/app/public/* public/storage/ || true
RUN chmod -R 755 public/storage

# Expose port 8000 for Render
EXPOSE 8000

# Run migrations and start the Laravel built-in server
CMD php artisan migrate --force && sleep 2 && php artisan serve --host=0.0.0.0 --port=8000
