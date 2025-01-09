const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userService = require('../../modules/user/service/user.service');
const bcrypt = require('bcrypt');
const User = require('../../modules/user/model/user')

passport.serializeUser(function(user, cb) { // store user in session
    process.nextTick(function() {
        console.log(user.firstName)
        console.log(user.lastName)
        cb(null, { id: user.id, username: user.username, firstName: user.first_name, lastName: user.last_name}); // store id and username in session
    });
});

passport.deserializeUser(function(user, cb) { // retrieve user from session
    process.nextTick(function() {
        return cb(null, user);
    });
});



passport.use(
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, cb) => {
            try {
                const user = await userService.findAdminByUsername(username);

                if (!user) {
                    return cb(null, false, { message: "User not found" });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return cb(null, false, { message: "Incorrect password" });
                }

                return cb(null, user);
            } catch (err) {
                return cb(err);
            }
        }
    ));


module.exports = passport;