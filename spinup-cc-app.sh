
docker volume create cc-db-test-data

docker run --rm -it --name cc-mongo -p 27017:27017 -v cc-db-test-data:/data/db -d mongo

docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app --link=cc-mongo:mongodb -e MONGODB_PORT_27017_TCP_ADDR="172.17.0.2" -p 10010:10010 --name cc-app -it node:4 /bin/bash



