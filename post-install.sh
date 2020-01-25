# NPM post install hook
mkdir downloads;

# Copy but don't overwrite if already existing
cp -n ./public/cc-admin/.env_example ./public/cc-admin/.env

# Creates the admin react scripts
npm run build-admin;

echo "######################"
echo "# Running Migrations #"
echo "######################"

# Runs data migrations
npm run migrate;

echo
echo "#####################"
echo "# CC App installed  #"
echo "#####################"
echo
echo "Run 'npm start' to spinup dev server."
echo
