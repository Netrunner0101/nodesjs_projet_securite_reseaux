FROM node:18-bookworm-slim

# Install build tools required by better-sqlite3 and bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install production dependencies (native modules compile here)
RUN npm ci --production

# Copy application source
COPY . .

# Create directory for SQLite data persistence
RUN mkdir -p /app/data

# Expose the API port
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "index.js"]
