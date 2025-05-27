# Use Node.js base image
FROM node:18-alpine

# Install system dependencies: unzip & Java for SonarScanner, plus your other tools
RUN apk add --no-cache \
    bash \
    curl \
    docker-cli \
    unzip \
    openjdk11-jre

# Install SonarScanner CLI
# (adjust SCANNER_VERSION to the latest stable if needed)
ENV SCANNER_VERSION=7.1.0.4889
RUN curl -sSL "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCANNER_VERSION}-linux.zip" \
    -o /tmp/sonar-scanner.zip \
    && unzip /tmp/sonar-scanner.zip -d /opt \
    && mv "/opt/sonar-scanner-${SCANNER_VERSION}-linux" /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner \
    && rm /tmp/sonar-scanner.zip

# Set working directory
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY index.js sonar.js ./
COPY src/ ./src/
COPY views/ ./views/
COPY public_html/ ./public_html/

# Expose & launch
EXPOSE 3000
CMD ["node", "index.js"]
