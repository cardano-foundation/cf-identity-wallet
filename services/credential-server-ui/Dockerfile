FROM node:lts-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build


FROM nginx:alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

COPY --from=build /app/dist /usr/share/nginx/html

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh /env.sh

# Make our shell script executable
RUN chmod +x /env.sh

EXPOSE 80

# Start Nginx server
CMD ["/bin/sh", "-c", "/env.sh && nginx -g \"daemon off;\""]
