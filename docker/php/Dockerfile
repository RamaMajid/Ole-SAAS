FROM php:8.4-fpm-alpine

# Install system dependencies yang dibutuhkan Laravel
RUN apk add --no-cache \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    oniguruma-dev \
    libxml2-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring pcntl xml zip

# Install Redis extension untuk PHP (berguna nanti untuk caching & queue)
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Copy Composer dari image resminya
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/backend