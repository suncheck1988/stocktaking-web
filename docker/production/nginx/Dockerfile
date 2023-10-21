FROM node:14-alpine as builder

ENV VUE_APP_API_URL=%%VUE_APP_API_URL%%

RUN mkdir -p /app
WORKDIR /app

COPY ./package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.21-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

ADD ./docker/production/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/production/nginx/docker-entrypoint-env.sh /
RUN chmod +x /docker-entrypoint-env.sh

ENTRYPOINT ["/docker-entrypoint-env.sh"]
CMD ["nginx", "-g", "daemon off;"]
