# The County Committee Sunlight Project App

> App for ccsunlight.org

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

The admin uses "admin on rest". 

The data is stored in a local dockerized mongo and the entire image is backed up periodically.

## Requirements

### Docker
The app runs via docker. Docker creates containers
with the specs below. You can try to use without docker, but
 if you can use docker, it will set these
up automatically for you.

- Mongo DB  3.4.4  
- Node 6.10  
- NPM  
- PM2 - Node process manager  

*On production server there is a NGINX reverse proxy to enable SSL. It's not necessary for local dev.


## Getting Started
Getting up and running is as easy as 1, 2, 3...10

1. git clone [repo link] /your/app/path

2. cd /your/app/path

3. Spin up docker containers:

Run: 
```
bash spinup-local-and-ssh.sh
```

This will create three docker containers, one with mongo, the other with node and a persistant storage docker container. 

4. You should see a prompt that looks like this:
```
root@4b8a402c7f31:/usr/src/app#
```

4. Run
```
npm install
```

This will install the node dependancies. It's important the this is done inside the running app container otherwise there may be errors with bcrypt. (see troublshooting below)

4. This will stop and restart the docker containers (except the persistant storage) and should leave you inside the cc-app container at a bash prompt

4. duplicate the ".env_example" as ".env" in the root of your dir. This will be where your keys and pws will go. 

4. If you have proprietary DB setup info update the ".env" file to your settings. Otherwise the DB vars can be left as is for dev, however, ~this is strongly discouraged to leave for production use as this DB will have no PW and is only for dev.~

Enter a alphanumeric key for AUTHENTICATION_SECRET. (512 chars recommended for production).

4. run 

	```
	bash ./init-migration.sh
	```
* Replace the mongo DB url with what is specified in the .env file you created.


This will create a super admin user with
a un and pw. 

**It will output this in the console. Make sure you copy and save this to a secure location.** You will not be able to see this again once your terminal session closes. 

6. Start your app
    
    ```
    npm start
    ```


alternatively you could run through PM2 with ``` ./node_modules/.bin/pm2 start ```, which is a process manager. For dev you may not want this.


When the app starts for the first time it will run additional imports for the map geometry which will take a little while.

9. Go to your homepage
http://localhost

10. Try logging into the admin with the sadmin creds you saved before. 
http://localhost/cc-admin/

11. Report any bugs in the issues section of the repo.


## Deploying
Deploying can be done by running the "deploy-prod.sh" script in the scripts folder. 

1. Merge and push changes to the master branch.
2. From your local terminal in the root run:
```
bash scripts/deploy-prod.sh
```
3. It will prompt you for a password. Enter password and hit enter.
4. The script will ssh into the droplet, pull down the latest changes from master and destroy and recreate and spinup the docker nodes. 

note: There will be appoximately 1 to 3 minutes of downtime while this happens.

## Troubleshooting

### bcrypt npm error
If you npm install outside of the docker, the bcrypt inside of the docker will error, and vice versa, which kills the npm install process. 

To fix delete the node_modules folder and do npm install inside the docker in that case. Otherwise, comment out bcrypt in package.json. It's used for the email invite to the admin so is only necessary for that section.

### App not responding 
Most of the time this is due to memory usage. The Mongo instance uses a good amount of memory. I resized the instance to a bigger droplet and it hasn't crashed since then. If it does get a memory overload, run the "restart-prod.sh" script in the scripts folder.
```
bash scripts/restart-prod.sh

```

This will restart the *app on the actual server*. If the issue still occurs, this could mean the droplet itself needs to be restarted. If so follow the digital ocean instructions to power off and restart the droplet. Then run the "restart-prod.sh" in the scripts folder.

### Everything is broken
The entire droplet is backed up weekly. You should be able to restore a backup. I haven't actually done this yet, so you may have to run the spinup script. Just keep in mind if the issue is with the latest code and you pull the changes, it will overwrite the code in the backup. Also this will delete any changes made on that instance since the last backup.
https://cloud.digitalocean.com/droplets/45901904/backups?i=af9b24



### SSL CERT 

The SSL cert was generated following this tutorial
https://code.lengstorf.com/deploy-nodejs-ssl-digitalocean/



## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g feathers-cli             # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.2.0__
- Updating readme with dev instructions
- Creating new branches

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
