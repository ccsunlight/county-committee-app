
# Creating env file from sample
# cp .env_example .env

# Installs pdf util dependancy

# Runs data migrations
npm run migrate;

# Copy but don't overwrite if already existing
cp -n ./public/cc-admin/.env_example ./public/cc-admin/.env

# Creates the admin react scripts
npm run build-admin;

echo
echo "#####################"
echo "# CC App installed. #"
echo "#####################"
echo
echo "Run 'npm start' to spinup dev server."
echo