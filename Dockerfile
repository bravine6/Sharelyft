FROM node:16-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./
RUN npm ci --production

# Copy only necessary files (not node_modules)
COPY index.js ./
COPY src/ ./src/
COPY views/ ./views/
COPY public_html/ ./public_html/

EXPOSE 3000

CMD ["node", "index.js"]