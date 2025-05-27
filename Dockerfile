# Use Node.js base image
FROM node:18-alpine

# Install Docker CLI
RUN apk add --no-cache \
    bash \
    curl \
    docker-cli \
    xvfb \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    ca-certificates \
    && npm ci --production

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy application files
COPY index.js ./
COPY src/ ./src/
COPY views/ ./views/
COPY public_html/ ./public_html/

# Expose app port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
