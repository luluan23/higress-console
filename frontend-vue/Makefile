PROJECT="cmdb_permission_front"
BINARY="cmdb_permission_front"
BUILDTIME=`date '+%Y%m%d%H%M'`
DOCKERHUB="xsjop-harbor.seasungame.com/bigdata"

docker_push: ## Push docker image to registry
	docker build -t ${PROJECT}/${BINARY}:latest -f Dockerfile .
	docker tag ${PROJECT}/${BINARY}:latest ${DOCKERHUB}/${BINARY}:${BUILDTIME}
	docker push ${DOCKERHUB}/${BINARY}:${BUILDTIME}

docker_build: ## Build docker image
	docker build -t ${PROJECT}/${BINARY} -f Dockerfile .

build: ## Build npm dist
	npm run build
	#zip -r archive/dist.`date '+%Y%m%d%H%M'`.zip dist

help: ## Display this help message
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

.SILENT: help build
