const passport = require('../../../config/auth/passport');
const userService = require('../../user/service/user.service');

class AuthController {
    // [GET] /login
    showLoginForm(req, res) {
        res.render('layouts/auth', {
            layout: 'auth',
            title: 'Login',
        });
    }

    // [POST] /login
    async login(req, res, next) {

        passport.authenticate('local', {keepSessionInfo: true}, async (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).json({message: 'Invalid username or password!'});
            }

            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }

                req.flash('success', 'Login successful!');
                // we handle the response manually on the client, so we have to send the redirect URL as json to
                // avoid the automatic request of the client.
                res.json({redirectUrl: '/dashboard'});
            });
        })(req, res, next);
    }

    // [GET] /logout
    async logout(req, res, next) {
        try {
            await req.logout(function (err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', 'Logout successfully!');
                res.redirect('/auth/login');
            });
        } catch (error) {
            res.status(500).send('An error occurred!');
        }
    }

    // [POST] /change-password
    async changePassword(req, res) {
        try {
            const {currentPassword, newPassword} = req.body;
            const userId = req.user.id;

            const result = await userService.changePassword(userId, currentPassword, newPassword);
            if (result.error) {
                return res.status(400).json({message: result.error});
            }

            res.json({message: 'Password changed successfully!'});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'An error occurred, please try again!'});
        }
    }
}

module.exports = new AuthController();