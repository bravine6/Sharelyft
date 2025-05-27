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
    unzip

# Install SonarScanner CLI
RUN curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip \
    && unzip sonar-scanner.zip -d /opt \
    && ln -s /opt/sonar-scanner-*/bin/sonar-scanner /usr/local/bin/sonar-scanner \
    && rm sonar-scanner.zip

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY index.js ./  
COPY src/ ./src/
COPY views/ ./views/
COPY public_html/ ./public_html/

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
