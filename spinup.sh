
docker volume create cc-db-test-data

# you can ignore error from this command
docker stop cc-mongo || true && docker rm cc-mongo || true

docker run --rm -it --name cc-mongo -p 27017:27017 -v cc-db-test-data:/data/db -d mongo --auth

# you can ignore error from this command
docker stop cc-app || true && docker rm cc-app || true

docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app --link=cc-mongo:mongodb -e MONGODB_PORT_27017_TCP_ADDR="172.17.0.2" -p 80:80 -e "NODE_ENV=production" --name cc-app node:6.10.0 sh -c "npm install ; npm start"  
