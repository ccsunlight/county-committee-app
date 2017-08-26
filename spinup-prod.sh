
docker volume create cc-db-test-data

# you can ignore error from this command
#
printf "\n\n"
echo "#########################"
echo "#      CC Sunlight      #"
echo "#########################"
printf "\n"
printf "environment: production\n\n"
printf "Stopping and removing existing cc-mongo container...\n\n"
docker stop cc-mongo > /dev/null 2>&1
docker rm cc-mongo > /dev/null 2>&1

printf 'Starting Mongo container...\n'
printf '\n'
printf "Container ID: "
docker run --rm -it --name cc-mongo -p 27017:27017 -v cc-db-test-data:/data/db -d mongo --auth
printf "\n"
printf "Mongo is started.\n\n\n"

printf "Stopping and removing existing cc-app container...\n\n"
# you can ignore error from this command
docker stop cc-app > /dev/null 2>&1
docker rm cc-app > /dev/null 2>&1

printf "Starting CC app node container...\n"
printf "\n"
printf "Container ID: "
docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app --link=cc-mongo:mongodb -e MONGODB_PORT_27017_TCP_ADDR="172.17.0.2" -p 25:25 -p 587:587 -p 4000:80 -p 465:465 -e "NODE_ENV=production" --name cc-app -d node:6.10.0 sh -c "npm install ; ./node_modules/.bin/pm2 start src --name=app --no-daemon" 

printf "\n"
printf "County Committee has been started.\n\n"
printf "Bye.";
