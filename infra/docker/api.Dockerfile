FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./

# Copy API app
COPY apps/api ./apps/api

# Install dependencies
RUN npm ci

# Build
RUN npm run build --workspace=apps/api

EXPOSE 3001

CMD ["npm", "run", "dev", "--workspace=apps/api"]
