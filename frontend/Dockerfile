# Stage 1: Build the React + Vite frontend
FROM node:20-alpine AS build
WORKDIR /app

# Accept Vite environment variables as build arguments
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Copy package files from frontend directory (root build context)
COPY frontend/package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve using Nginx Alpine
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Support dynamic Railway $PORT by replacing port 80 at container startup
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80;/listen ${PORT:-80};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
