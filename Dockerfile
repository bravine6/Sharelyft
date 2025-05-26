# Use Node.js base image
FROM node:18-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli bash curl

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
