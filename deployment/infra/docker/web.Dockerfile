FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./

# Copy web app
COPY apps/web ./apps/web

# Install dependencies
RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=apps/web"]
