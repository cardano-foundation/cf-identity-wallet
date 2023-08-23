FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn
CMD [ "node", "relay" ]