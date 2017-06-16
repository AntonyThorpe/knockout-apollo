import { expect, assert } from "meteor/practicalmeteor:chai";
import { Accounts } from "meteor/accounts-base";
import { resetDatabase } from 'meteor/xolvio:cleaner';

/**
 * Model Tests
 * meteor test --driver-package=practicalmeteor:mocha --port 3002
 */

describe("Meteor Users", function () {
    describe("#Accounts.createUser", function() {

        before(function() {
            resetDatabase();

            var _id = Accounts.createUser({
                "email": "admin@test.com",
                "password": "pass"
            });

            Meteor.users.update({ // Set verified to true
                _id: _id
            }, {
                $set: {
                    'emails.0.verified': true
                }
            });

        });

        it("should work", function(done){
            assert.equal(1, 1, "works");
            done();
        });

/*
        it('should save without error', function(done) {
            // Login admin user
            //var user
            item.save(function(err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
*/


    });
});
