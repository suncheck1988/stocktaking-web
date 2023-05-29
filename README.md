### Сборка контейнера
`docker-compose up --build -d`
`docker-compose down && docker-compose up --build -d`

### Настройки

Скопировать `.env.dist` в `.env`

```
VUE_APP_API_URL=URL бэка
VUE_APP_ENV=dev|test|prod

NODE_PORT=
NGINX_PORT=Порт на бэке
```

### Сборка приложения

```
docker-compose exec node npm install
docker-compose exec node npm run serve
```

### Установка пакетов

```
docker-compose exec node npm install packetName
```
