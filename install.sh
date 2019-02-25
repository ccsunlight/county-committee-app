
# Creating env file
cp .env_example .env

# Installs pdf util dependancy
npm run install-pdf-lib;

npm install;

# Runs data migrations
npm run migrate;

# Creates the admin react scripts
npm run build-admin;

echo "CC App installed."

echo "Run 'npm start' to spinup dev server."