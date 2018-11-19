
docker volume create cc-db-test-data

# you can ignore error from this command
#
printf "\n\n"
echo "#########################"
echo "#      CC Sunlight      #"
echo "#########################"
printf "\n"
printf "environment: local\n\n"
printf "Stopping and removing existing cc-mongo container...\n\n"
docker stop cc-mongo 
docker rm cc-mongo 

printf 'Starting Mongo container...\n'
printf '\n'
printf "Container ID: "
docker run --rm -it --name cc-mongo -p 27017:27017 -v cc-db-test-data:/data/db -d mongo:3.6
printf "\n"
printf "Mongo is started.\n\n\n"

printf "Stopping and removing existing cc-app container...\n\n"
# you can ignore error from this command
docker stop cc-app > /dev/null 2>&1
docker rm cc-app > /dev/null 2>&1

printf "Starting cc-app container at bash prompt in container ...\n\n"

docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app --link=cc-mongo:mongodb -e MONGODB_PORT_27017_TCP_ADDR="172.17.0.2" -p 25:25 -p 587:587  -p 9229:9229 -p 80:80 -p 3000:3000 -p 443:443 -p 465:465 -e "NODE_ENV=local" -it --name cc-app node:8.11.3 bash

