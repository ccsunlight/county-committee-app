# The County Committee Sunlight Project App

> App for county committee information

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

The admin uses admin on rest

It uses https in all environments, even localhost.

## Getting Started
Getting up and running is as easy as 1, 2, 3...10

1. git clone [repo link]

2. cd into/app/root

3. Run bash spinup-local.sh
This will create three docker containers, one with mongo, the other with node and a persistant storage docker container. It will then leave you at the "node" container bash prompt

4. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

5. Install your dependencies
    
    ```
    cd path/to/county-committee; npm install
    ```

6. Run migrations. This will create a super admin user with
a un and pw. It will output this in the console. Copy and save this to a secure location.
	
	Inside docker container

	```
	./node_modules/.bin/migrate -d mongodb://172.17.0.2:27017/county-committee up
	```
	The -d is the address of your mongo DB instance. The IP above assumes it's in a docker container. The address would be "localhost" if you are not using docker.


	```
	./node_modules/.bin/migrate -d mongodb://localhost:27017/county-committee up
	```

7. Generate a cert
TO DO

8. Start your app
    
    ```
    npm start
    ```

9. Go to your homepage
https://localhost

10. Try logging into the admin with the sadmin creds you saved before. 
https://localhost/cc-admin/

11. Report any bugs in the issues section of the repo.

## Migrations
You will need to run migrations to be able to login and to update the models and data whenever there is an update that changes any schemas. The migrations module being used is "migrate-mongoose"

1. Af
.
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
