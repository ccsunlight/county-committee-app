
# COUNTY COMMITTEE API

### ALPHA PROTOTYPE 
v0.0.1 

### Requirements  
- Node 4  
- Mongo DB running  
- Docker  

You can run things without docker but you may have to tweak some settings.


### Docker quickstart
The below is if you want to use docker to load the app. It's not necessary if you have your own environment node and Mongo.

Only tested on mac but should work on other OS's.

1. bash ./spinup-cc-app.sh  
If it works properly then you should have a bash prompt in the container

2. Run "npm start"
Sails app should load. 

3. Go to http://localhost:10010 to test it out

4. Go to http://localhost:10010/countycommittee

#### Optional
You can also ssh into running container:
docker exec -it cc-app /bin/bash
 

###  Import committee list 
You'll need to import a PDF to show any data.

1. Save a text pdf of PARTY POSITION CERTIFIED LIST pdf in "import" folder

2. run import-cc-pdf.js [filename]  
It will not overwrite the previous records so you'll have to delete them if you want to reimport

3. Try it out.   
http://localhost:10010/countycommittee  
http://localhost:10010/countycommittee?state=NY  
http://localhost:10010/  countycommittee?office_holder=Vacancy  

#### A [Swagger](https://www.npmjs.com/package/swagger) / [Sails](http://sailsjs.org) application 

