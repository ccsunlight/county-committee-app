# The County Committee Sunlight Project App

> App for county committee information

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

The admin uses admin on rest

## Requirements

### Docker
The app runs via docker. Docker creates containers
with the specs below. You can try to use without docker, but if you can use docker, it will set these
up automatically for you.

Mongo DB  3.4.4  
Node 6.10  
NPM  
PM2 - Node process manager  

*On production server there is a NGINX reverse proxy to enable SSL. It's not necessary for local dev.

## Getting Started
Getting up and running is as easy as 1, 2, 3...10

1. git clone [repo link] /your/app/path

2. cd /your/app/path

3. Run bash spinup-local-and-ssh.sh
This will create three docker containers, one with mongo, the other with node and a persistant storage docker container. 

4. This will stop and restart the docker containers (except the persistant storage) and should leave you inside the cc-app container at a bash prompt

5. run 
```
npm migrate
```
This will create a super admin user with
a un and pw. *It will output this in the console. Copy and save this to a secure location.*

6. Start your app
    
    ```
    npm start
    ```

9. Go to your homepage
http://localhost

10. Try logging into the admin with the sadmin creds you saved before. 
http://localhost/cc-admin/

11. Report any bugs in the issues section of the repo.




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

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
