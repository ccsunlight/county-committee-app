export NODE_ENV=production;
npm run install; 
npm run migrate; 
./node_modules/.bin/pm2 start src/ --name=app --no-daemon
   