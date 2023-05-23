require("dotenv").config();
const passport = require('../Middleware/authMiddleware');
const database = require("../Models/database.model");
const Review = database.Review;
const User = database.User;


const authController = {
    googleAuth: async (req, res, next) => {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    },
    googleAuthRedirect: passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    displayLogin: async (req, res) => {
        // populateDb();
        req.session.previousUrl = req.headers.referer || '/';
        const previousUrl = req.session.previousUrl;

        if (req.isAuthenticated()) {
            req.session.previousUrl = previousUrl;
            res.redirect("/profiledetails")
        } else {
            res.render("login");
        }
    },

    displaySignup: async (req, res) => {
        if (req.isAuthenticated()) {
            req.session.previousUrl = req.headers.referer || '/';
            res.redirect("/profiledetails");
        } else {
            res.render("signup");
        }
    },

    postSignup: async (req, res) => {
        User.register({ username: req.body.username.toLowerCase() }, req.body.password, (err, foundUser) => {
            if (err) {
                console.log(err);
                res.redirect("/signup");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/profiledetails")
                });
            }
        })

    },

    postLogin: async (req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        const previousUrl = req.session.previousUrl || "/"
        req.logIn(user, (err) => {
            if (err) {
                console.log(err);
                res.redirect("/login")
            } else {
                passport.authenticate("local")(req, res, () => {
                    req.session.previousUrl = previousUrl;
                    res.redirect("/profiledetails")
                })
            }
        })
    },
    logout: async (req, res) => {
        req.logOut((err) => {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/");
            }
        });
    },

    getReviews: async (req, res) => {
        Review.find({})
            .then((reviews) => {
                res.json(reviews);
            })
    }
}

module.exports = authController;