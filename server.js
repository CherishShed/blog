require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const cors = require('cors');
var corsOptions = {
    origin: "*"
}
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
    secret: process.env.LOCAL_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/blogDB");
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    posts: [mongoose.Schema.Types.ObjectId]
})

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    coverImage: String,
    author: mongoose.Schema.Types.ObjectId,
    tags: [String]
}, { timestamps: true })




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("user", userSchema);
const Post = mongoose.model("blogPost", postSchema);
passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username, name: user.name });
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
        User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        User.findById(req.user.id)
            .then((user) => {
                Post.find({})
                    .then((post) => {
                        res.render("index", { user, post })
                    }
                        // console.log(user);
                    );
            })
    } else {
        res.redirect("/login");
    }
})

app.get("/api/getallPosts", (req, res) => {
    // console.log(req.user)
    Post.find({})
        .then((data) => {
            // console.log(user);
            // data.forEach((post) => {
            //     post.coverImage.data = post.coverImage.data.toString('base64');
            // })
            res.json(data);
        })

})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] })
)
app.get('/auth/google/blog', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        User.findById(req.user.id)
            .then((user) => {
                // console.log(user);
                res.redirect("/");
            })
    } else {
        res.render("login");
    }
})

app.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        User.findById(req.user.id)
            .then((user) => {
                // console.log(user);
                res.redirect("/");
            })
    } else {
        res.render("signup");
    }
})

app.get("/viewpost?id", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        const { id } = req.params
        User.findById(id)
            .then((post) => {
                // console.log(user);
                res.render("blog", { post });
            })
    } else {
        res.redirect("/login");
    }
})

app.post("/signup", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/")
            });
        }
    })

})
app.post("/login", (req, res) => {
    res.write
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/");
            })
        }
    })
})
app.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/");
        }
    });
})
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("listening on port " + PORT);
})
