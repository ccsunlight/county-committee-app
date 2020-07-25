# The County Committee Sunlight Project App

> App for ccsunlight.org

## To do

- feat: parser for district part mappings
- fix: importer not returning CSV validation result message in admin
- data: Add part to cc lists
- refactor: to postgres

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

The admin uses "admin on rest".

The data is stored in a local dockerized mongo and the entire image is backed up periodically.

## Requirements

### Docker

The app runs via docker but you'll have to install those two applications manually before starting.

- Mongo DB 3.6
- Node 10.16 with NPM

Docker creates containers with the specs below. You can try to use without docker, but
if you can use docker, it will install and set everything
up automatically for you.

\*On production server there is a NGINX reverse proxy to enable SSL. It's not necessary for local dev.

### Dependencies

The app will automatically install these itself if you have docker installed.

- [Express](https://expressjs.com/)
- [Feathers](https://feathersjs.com/)
- [MongoDB](https://docs.mongodb.com/)
- [Mongoose](http://mongoosejs.com/)
- [Material Design Lite](https://getmdl.io)
- [Gulp](https://gulpjs.com/)
- [Admin On Rest](https://github.com/marmelab/admin-on-rest)
- [ReactJS](https://reactjs.org/)
- [Passport](http://www.passportjs.org/)
- [Docker](https://www.docker.com/)
- [PM2](http://pm2.keymetrics.io/)
- [LetsEncrypt](https://letsencrypt.org/)
- [NGINX](https://nginx.org/en/) - for reverse proxy for SSL on production
- [PDF-To-Text Extract](https://github.com/nisaacson/pdf-text-extract)
- [Google Maps API](https://developers.google.com/maps/documentation/javascript/)

## Getting Started

Getting up and running is as easy as 1, 2, 3...10

1.  `git clone [repo link] /your/app/path`

1.  You'll need to make a data directory if you don't already have one on your host machine
    `sudo mkdir -p /data/db`

1.  `cd /your/app/path`

1.  The first time we need to create the volume for the DB

    ```
    docker volume create --name=cc-db
    ```

1.  The first time you need to comment out this line in docker-compose.yml for local dev (Do NOT do this on any public facing apps!)
    ```
    # command: mongod --auth
    ```
1.  Spin up and ssh into docker container to run install scripts:

1.  SSH into container

    ```
    bash docker-run-ssh.sh
    ```

    This will create three docker containers, one with mongo, the other with node and a persistent storage docker container.

1.  You should see a prompt that looks like this:

    ```
    root@121fsfsw:/usr/src/app
    ```

1.  Run

    ```
    npm run install
    ```

    This will install the node dependancies and runs migrations. It's important the this is done inside the running app container otherwise there may be errors with bcrypt. (see troubleshooting below)

    You will be prompted to record the superadmin login and pw. _You will not be given another opportunity to see this so make sure you write it down._

1.  Start your app

    ```
    npm start
    ```

    Alternatively you could run through PM2 with `./node_modules/.bin/pm2 start`, which is a process manager. For dev you may not want this.

    When the app starts for the first time it will run additional imports for the map geometry which will take a little while.

1.  Go to your homepage
    http://localhost

1.  Try logging into the admin with the sadmin creds you saved before.
    http://localhost/cc-admin/

1.  Report any bugs in the issues section of the repo.

### Further notes

If you have proprietary DB setup info update the ".env" file to your settings. Otherwise the DB vars can be left as is for dev, however, **it is strongly discouraged to leave for production use as this DB would have no PW!**

For email sending (reset pw account activation) you'll need a GMAIL account, and is suggested you get a new one for this project.

Enter a alphanumeric key for AUTHENTICATION_SECRET. (512 chars recommended for production).

## Deploying

Deploying can be done by running the "deploy-prod.sh" script in the scripts folder.

1.  Merge and push changes to the master branch.
2.  From your local terminal in the root run:

```
bash scripts/deploy-prod.sh
```

3.  It will prompt you for a password. Enter password and hit enter.
4.  The script will ssh into the droplet, pull down the latest changes from master and destroy and recreate and spinup the docker nodes.

note: There will be approximately 1 to 3 minutes of downtime while this happens.

## API

Feathers uses a restful, enveloped JSON API. The API docs and can be found at:

http://{your-domain}/api/v1/docs/

More info on how to use can be found here:
https://docs.feathersjs.com/api/client/rest.html

## Troubleshooting

### bcrypt npm error

If you npm install outside of the docker, the bcrypt inside of the docker will error, and vice versa, which kills the npm install process.

To fix delete the node_modules folder and do npm install inside the docker in that case. Otherwise, comment out bcrypt in package.json. It's used for the email invite to the admin so is only necessary for that section.

### App not responding

Most of the time this is due to memory usage. The Mongo instance uses a good amount of memory. I resized the instance to a bigger droplet and it hasn't crashed since then. If it does get a memory overload, run the "restart-prod.sh" script in the scripts folder.

```
bash scripts/restart-prod.sh
```

This will restart the _app on the actual server_. If the issue still occurs, this could mean the droplet itself needs to be restarted. If so follow the digital ocean instructions to power off and restart the droplet. Then run the "restart-prod.sh" in the scripts folder.

### Everything is broken

The entire droplet is backed up weekly. You should be able to restore a backup. I haven't actually done this yet, so you may have to run the spinup script. Just keep in mind if the issue is with the latest code and you pull the changes, it will overwrite the code in the backup. Also this will delete any changes made on that instance since the last backup.
https://cloud.digitalocean.com/droplets/45901904/backups?i=af9b24

### SSL CERT

The SSL cert was generated following this tutorial
https://code.lengstorf.com/deploy-nodejs-ssl-digitalocean/

## Managing Committee Data

This is still a WIP. There are some things that are automated and some that need manual scripting. It is the aim of this project to automate the flow of data.

### Importing Certified List

From the command line you need to run the following:

```
 node path/to/your/certified-list.pdf"
```

If successful, this will import into the "imports" section in the admin. You will be able to approve the list and then it will become.

### Importing Party Call

The party call determines what EDs and positions in those EDs are open for an upcoming election.

```
node scripts/import-party-call -f "path/to/your/party-call.csv" -c "Kings" -p "Democratic" -e "September 13, 2018" -s "NY"
```

The CSV format is as follows:

```
district_key,County Committee
77001,2
77002,2
77003,2
```

### OCR

https://www.pdftoexcelconverter.net/

### Creating County Committee

@todo

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

**0.2.0**

- Updating readme with dev instructions
- Creating new branches

**0.1.0**

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
