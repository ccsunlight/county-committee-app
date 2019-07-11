
# Creating env file from sample
cp .env_example .env

# Installs pdf util dependancy
npm run install-pdf-lib;

if [ -d "./node_modules" ]; then rm -Rf ./node_modules; fi
