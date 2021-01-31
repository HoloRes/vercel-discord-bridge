FROM node:lts-alpine

WORKDIR /app

WORKDIR /app
COPY package.json .
COPY package-lock.json .

# Install packages
RUN npm ci --only=production

# Copy remaining files except files in .dockerignore
COPY . .

# Set start command
CMD ["node", "index.js", "--trace-events-enabled", "--trace-warnings"]