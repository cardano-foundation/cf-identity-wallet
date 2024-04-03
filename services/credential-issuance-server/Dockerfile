ARG TARGETPLATFORM=linux/amd64
FROM --platform=$TARGETPLATFORM node:21.5.0 AS builder
WORKDIR /app
RUN apt update -qq && apt install -y build-essential && apt clean
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "start" ]
