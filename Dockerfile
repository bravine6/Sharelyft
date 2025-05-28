# Use Node.js base image
FROM node:18-alpine

# Install system dependencies: unzip & Java for SonarScanner + Docker CLI
RUN apk add --no-cache \
    bash \
    curl \
    docker-cli \
    unzip 

# Install the SonarScanner CLI via npm
# this gives you `sonar-scanner` on the PATH
# RUN npm install -g @sonarsource/sonar-scanner-cli

# Set working directory
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci

# Copy everything else in one go
COPY . .

# Expose and run
EXPOSE 3000
CMD ["node", "index.js"]
