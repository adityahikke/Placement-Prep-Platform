# Stage 1: Build the React + Vite frontend
FROM node:20-alpine AS build
WORKDIR /app

# Accept Vite environment variables as build arguments
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve using Nginx Alpine with dynamic $PORT support
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx Alpine automatically substitutes environment variables in /etc/nginx/templates/*.template
RUN mkdir -p /etc/nginx/templates
RUN echo 'server { \
    listen ${PORT}; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $$uri $$uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

ENV PORT=80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
