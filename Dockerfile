# Frontend Dockerfile (React build served by Nginx)
# Multi-stage build

FROM node:18-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . ./
RUN npm run build

# Nginx runtime
FROM nginx:1.25-alpine AS runtime

# Copy build assets
COPY --from=build /app/build /usr/share/nginx/html

# Default Nginx config to serve SPA and proxy /api
# We will template this file to allow dynamic upstream
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose Nginx
EXPOSE 80

# Environment variables for runtime templating
ENV API_HOST=backend
ENV API_PORT=3001

# Render the template and run Nginx
CMD /bin/sh -c "envsubst '\$API_HOST \$API_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
