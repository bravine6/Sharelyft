# Use Node.js base image
FROM node:18-alpine

# Install required system dependencies for Docker CLI and Cypress + unzip
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
    unzip \
    openjdk11  

# Install SonarScanner CLI
RUN npm install -g sonarqube-scanner


# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY index.js ./  
COPY sonar.js ./
COPY src/ ./src/
COPY views/ ./views/
COPY public_html/ ./public_html/

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
