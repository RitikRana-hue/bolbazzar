FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json yarn.lock ./

# Copy API app
COPY apps/api ./apps/api

# Install dependencies
RUN yarn install --frozen-lockfile

# Build
RUN yarn workspace api build

EXPOSE 3001

CMD ["yarn", "workspace", "api", "dev"]
