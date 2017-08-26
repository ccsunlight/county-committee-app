'use strict';

const app = require('../src/app');
const apiPath = app.get('apiPath');
const generator = require('generate-password');

     
/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {


    var password = generator.generate({
            length: 10,
            numbers: true
        });
    // Create a user that we can use to log in
    var seedAdminData = {
        email: 'sadmin@ccsunlight.org',
        password: password,
        role: 'admin',
        firstname: 'Seed',
        lastname: 'Admin'
    };
    
    seedUser(seedAdminData);

    function seedUser(seedData) {
        app.service(apiPath + '/user').find({
            query: {
                email: seedData.email
            }
        }).then(result => {

            console.log('.find()', result);

            if (result.total === 0) {

                app.service(apiPath + '/user').create(seedData).then(user => {
                    console.log('Created default user', user);

                console.log('Here are your admin user details. Save this somewhere secure: ');
                console.log('un: ' + seedAdminData.email);
                console.log('pw: ' + password);
                done();

                }).catch(console.error);

            } else {

                let existingUser = result.data[0];

                app.service(apiPath + '/user').update(existingUser._id, seedData).then(user => {
                    console.log('Updated default user', user);
                    console.log('Here are your admin user details. Save this somewhere secure: ');
                    console.log('un: ' + seedAdminData.email);
                    console.log('pw: ' + password);
                    done();
                })

            }

            
        });
    }

   
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
    done();
};