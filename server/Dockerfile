# Stage 1: Base PHP-FPM image
FROM php:8.2-fpm

WORKDIR /var/www/html

# Install system dependencies, Nginx, and PHP extensions
RUN apt-get update && apt-get install -y \
    nginx \
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

# Install Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Clear and optimize Laravel cache
RUN php artisan config:clear && php artisan route:clear && php artisan view:clear

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage symlink
RUN php artisan storage:link || true

# Copy seeded images directly to public directory
RUN mkdir -p public/club_logos && cp -r storage/app/public/club_logos/* public/club_logos/ || true

# Copy Nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Expose port 8000
EXPOSE 8000

# Run migrations, start Nginx and PHP-FPM
CMD php artisan migrate --force && service nginx start && php-fpm
