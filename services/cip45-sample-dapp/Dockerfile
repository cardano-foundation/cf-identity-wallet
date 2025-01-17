ARG TARGETPLATFORM=linux/amd64
FROM --platform=$TARGETPLATFORM node:18 AS builder
WORKDIR /app
RUN apt update -qq && apt install -y build-essential && apt clean
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
COPY ./.env.cloud .env
RUN npm run build

FROM nginx:1.23-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./docker-assets/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
