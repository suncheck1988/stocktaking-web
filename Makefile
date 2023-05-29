init: init-ci frontend-ready
init-ci: docker-down-clear frontend-clear \
	docker-pull docker-build docker-up \
	frontend-init
up: docker-up
down: docker-down
restart: down up

update-deps: frontend-npm-upgrade restart

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down --remove-orphans

docker-down-clear:
	docker-compose down -v --remove-orphans

docker-pull:
	docker-compose pull

docker-build:
	docker-compose build --pull

frontend-init: frontend-npm-install

frontend-ready:
	docker run --rm -v ${PWD}/:/app -w /app alpine touch .ready

frontend-clear:
	docker run --rm -v ${PWD}/:/app -w /app alpine sh -c 'rm -rf .ready build'

frontend-npm-install:
	docker-compose exec node npm install

frontend-npm-upgrade:
	docker-compose exec node npm upgrade

build:
	docker --log-level=debug build --pull --file=docker/production/nginx/Dockerfile --tag=${REGISTRY}/stocktaking-frontend-nginx:${IMAGE_TAG} .

push:
	docker push ${REGISTRY}/stocktaking-frontend-nginx:${IMAGE_TAG}

validate-jenkins:
	curl --user ${USER} -X POST -F "jenkinsfile=<Jenkinsfile" ${HOST}/pipeline-model-converter/validate

deploy:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -rf site_${BUILD_NUMBER} && mkdir site_${BUILD_NUMBER}'

	envsubst < docker-compose-production.yml > docker-compose-production-env.yml
	scp -o StrictHostKeyChecking=no -P ${PORT} docker-compose-production-env.yml deploy@${HOST}:site_${BUILD_NUMBER}/docker-compose.yml
	rm -f docker-compose-production-env.yml

	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd site_${BUILD_NUMBER} && echo "COMPOSE_PROJECT_NAME=stocktaking" >> .env'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd site_${BUILD_NUMBER} && docker compose up --build --remove-orphans -d'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -f site'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'ln -sr site_${BUILD_NUMBER} site'

deploy-clean:
	rm -f docker-compose-production-env.yml

rollback:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd site_${BUILD_NUMBER} && docker stack deploy --compose-file docker-compose.yml stocktaking --with-registry-auth --prune'
