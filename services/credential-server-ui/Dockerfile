FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL
ENV REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL $REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL

ARG REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT
ENV REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT $REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT

RUN npm run build


FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]