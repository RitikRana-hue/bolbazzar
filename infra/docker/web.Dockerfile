FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json yarn.lock ./

# Copy web app
COPY apps/web ./apps/web

# Install dependencies
RUN yarn install --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "workspace", "web", "dev"]
