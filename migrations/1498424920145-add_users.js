'use strict';

const app = require('../src/app');
const apiPath = app.get('apiPath');
/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {

    // Create a user that we can use to log in
    var seedAdminData = {
        email: 'ccadmin@jon.com',
        password: '12345',
        role: 'admin',
        firstname: 'Seed',
        lastname: 'Admin'
    };

    // Create a user that we can use to log in
    var seedUserData = {
        email: 'ccuser@jon.com',
        password: '12345',
        role: 'user',
        firstname: 'Seed',
        lastname: 'User'
    };
    
    seedUser(seedUserData);
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

                }).catch(console.error);

            } else {

                let existingUser = result.data[0];

                app.service(apiPath + '/user').update(existingUser._id, seedData).then(user => {
                    console.log('Updated default user', user);
                })

            }
        });
    }

    done();
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
    done();
};