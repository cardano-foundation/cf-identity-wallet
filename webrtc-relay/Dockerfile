FROM node:18 AS builder
WORKDIR /app
RUN apt update -qq && apt install -y build-essential && apt clean
COPY . .
RUN npm install
CMD [ "node", "relay" ]
