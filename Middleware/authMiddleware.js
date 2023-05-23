require("dotenv").config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const database = require("../Models/database.model");

const User = database.User;
passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        // console.log(user)
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8081/auth/google/blog"
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile)

        User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value, googleProfilePic: profile._json.picture, firstName: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
            return cb(err, user);

        });
    }
));

module.exports = passport;