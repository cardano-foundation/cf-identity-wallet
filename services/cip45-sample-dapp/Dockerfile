ARG TARGETPLATFORM=linux/amd64
FROM node:18 AS builder
WORKDIR /app
RUN apt update -qq && apt install -y build-essential && apt clean
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.23-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm -rf /etc/nginx/conf.d
COPY docker-assets/etc/nginx/conf.d /etc/nginx/conf.d

EXPOSE 80
