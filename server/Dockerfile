# Backend Dockerfile (Node + Express + PostgreSQL)
# Suitable for Coolify as a standalone service

FROM node:18-alpine AS base

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY server/.env ./
COPY server/ ./

# Expose and run
EXPOSE 3001
CMD ["npm", "start"]
