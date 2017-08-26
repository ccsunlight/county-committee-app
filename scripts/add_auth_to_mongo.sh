

docker run --rm -it --name cc-mongo -p 27017:27017 -v cc-db-test-data:/data/db -d mongo

mongo admin mongo-user-setup.js

docker stop cc-mongo || true && docker rm cc-mongo || true	