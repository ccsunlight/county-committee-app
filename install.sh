
# Creating env file from sample
# cp .env_example .env

# Installs pdf util dependancy
npm run install-pdf-lib;

rm -R ./node_modules/

npm install;

# Runs data migrations
npm run migrate;

# Creates the admin react scripts
npm run build-admin;

echo
echo "#####################"
echo "# CC App installed. #"
echo "#####################"
echo
echo "Run 'npm start' to spinup dev server."
echo