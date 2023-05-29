FROM node:14-alpine as build

ARG VUE_APP_API_URL
ARG VUE_APP_ENV

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

FROM nginx:1.17-alpine
COPY --from=build /app/dist /usr/share/nginx/html
ADD ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
