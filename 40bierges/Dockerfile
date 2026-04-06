# Stage 1: Build the React app
FROM node:18-bookworm-slim AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Required for react-scripts 3.x on Node 18 (OpenSSL 3.0 compatibility)
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set API URL to relative path so nginx can proxy requests
ENV REACT_APP_API_URL=/api

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
