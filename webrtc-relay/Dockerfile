FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "relay" ]