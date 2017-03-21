# COUNTY COMMITTEE API

### ALPHA PROTOTYPE
v0.0.1

Only tested on mac but should work on other OS's.

### Docker quickstart
The below is if you want to use docker to load the app. If you want to use your own environment's node and Mongo, see [running without docker](#running-without-docker).

1. Install [Docker.](https://www.docker.com/)

1. Run "bash ./spinup-cc-app.sh".   
The script will create a mongo container, a storage volume, and an app container. It will run npm install on creation (this could take a few minutes). If it works properly then you should have a bash prompt in the container.

1. Run "npm start". The sails app should load.

1. Go to http://localhost:10010 and http://localhost:10010/countycommittee to test it out.  
(You will need to import data to test the api link. See below) 
@todo add seed data

#### Optional
You can also ssh into running container:
docker exec -it cc-app /bin/bash

### Running without docker

Requirements:

- Node 4
- Mongo DB running
- Docker

You'll have to tweak some settings.

###  Import committee list
You'll need to import a PDF to show any data. The PDF must have embedded text to work. 

1. Save a text pdf of PARTY POSITION CERTIFIED LIST pdf in "import" folder.

1. run import-cc-pdf.js [filename]
It will not overwrite the previous records so you'll have to delete them if you want to reimport

1. Try it out:
 * http://localhost:10010/countycommittee
 * http://localhost:10010/countycommittee?state=NY
 * http://localhost:10010/countycommittee?office_holder=Vacancy

#### A [Swagger](https://www.npmjs.com/package/swagger) / [Sails](http://sailsjs.org) application
