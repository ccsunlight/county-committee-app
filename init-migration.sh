
. .env

./node_modules/.bin/migrate --md ./migrations-legacy --autosync -d "${MONGODB_URL}" up 
