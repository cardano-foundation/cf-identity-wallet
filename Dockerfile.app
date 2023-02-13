FROM node:18 AS base
WORKDIR /app
COPY . /app
RUN apt update -qq && apt install -y build-essential
RUN npm install

FROM node:18 AS builder
WORKDIR /app
COPY --from=base /app /app
RUN npm run build

FROM node:18 AS local
WORKDIR /app
EXPOSE 3001
COPY --from=builder /app /app
ENTRYPOINT ["npm", "run", "dev"]

FROM nginx:1.23-alpine AS static
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./docker-assets/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
