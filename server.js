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
const multer = require("multer");
const { Console } = require("console");
var corsOptions = {
    origin: "*"
}
const upload = multer({ dest: "uploads/" })
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public", { root: __dirname }));
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
    firstName: String,
    lastName: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogPost"
    }],
    googleId: String,
    googleProfilePic: String,
    profilePic: String,
    profileUrl: String,
    socials: { linkedin: String, facebook: String, twitter: String, instagram: String },
    about: String
})

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    coverImage: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: String,
    url: String,
    tags: [String]
}, { timestamps: true })

const reviewSchema = new mongoose.Schema({
    person: String,
    comment: String,
    reviewImage: String,
}, { timestamps: true })




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
userSchema.virtual('name').get(function () {
    return this.firstName + ' ' + this.lastName;
});
const User = mongoose.model("user", userSchema);
const Post = mongoose.model("blogPost", postSchema);
const Review = mongoose.model("review", reviewSchema);
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
        // User.findOne({ username: profile.emails[0] })
        //     .then((err, foundUser) => {
        //         if (foundUser) {
        //             return (cb(err, foundUser))
        //         }
        //     })
        User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value, name: profile.displayName, googleProfilePic: profile._json.picture, firstName: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
            return cb(err, user);

        });
    }
));

app.get("/", (req, res) => {
    // populateDb();
    if (req.isAuthenticated()) {
        // console.log(req.user)
        const inSession = true
        User.findById(req.user.id).populate("posts")
            .then((user) => {
                Post.find({})
                    .then((post) => {
                        res.render("index", { user, post, inSession })
                    }
                        // console.log(user);
                    );
            })
    } else {
        Post.find({})
            .then((post) => {
                res.render("index", { post })
            }
                // console.log(user);
            );
    }
})

app.get("/api/getallPosts", (req, res) => {
    // console.log(req.user)
    var inSession = false
    if (req.isAuthenticated()) {
        // console.log(req.user)
        inSession = true
    }
    var signedInUser = false

    Post.find({}).populate('author', 'name profileUrl')
        .then((data) => {
            // console.log(user);
            // data.forEach((post) => {
            //     post.coverImage.data = post.coverImage.data.toString('base64');
            // })
            if (req.isAuthenticated()) {
                inSession = true

                User.findById(req.user._id)
                    .then((user) => {
                        console.log(user.name);
                        signedInUser = user;
                        res.json({ data, inSession, signedInUser });
                    })
            } else {
                res.json({ data, inSession, signedInUser });
            }
        })

})

app.get('/auth/google', (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
app.get('/auth/google/blog', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


app.get("/login", (req, res) => {
    // populateDb();
    req.session.previousUrl = req.headers.referer || '/';
    const previousUrl = req.session.previousUrl;
    // console.log(previousUrl)
    if (req.isAuthenticated()) {
        // console.log(req.user)
        User.findById(req.user.id)
            .then((user) => {
                if (user.firstName === null || user.lastName === null || (user.profilePic != null && user.googleProfilePic != null)) {
                    res.redirect("/profiledetails");
                } else {
                    res.redirect(req.session.previousUrl)
                }
                // console.log(user);
            })
    } else {
        res.render("login");
    }
})

app.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        res.redirect("/profiledetails");
    } else {
        res.render("signup");
    }
})

app.get("/posts/:id", (req, res) => {
    const { id } = req.params
    Post.findById(id).populate('author', 'name')
        .then((data) => {
            // console.log(data);
            // data.forEach((post) => {
            //     post.coverImage.data = post.coverImage.data.toString('base64');
            // })
            res.render('blog', { title: data.title });
        })
})
app.get("/api/posts/:id", (req, res) => {
    console.log("we ae here now")
    const { id } = req.params
    var inSession = false
    var signedInUser = false
    if (req.isAuthenticated()) {
        inSession = true
        signedInUser = req.user;
    }
    // console.log(signedInUser)
    Post.findById(id).populate("author", "name profileUrl")
        .then((data) => {
            // console.log(data)
            // console.log(user);
            User.findById(data.author.id).populate("posts")
                .then((user) => {
                    res.json({ data, inSession, author: user, signedInUser });
                })
        })
})

app.get("/profiledetails", (req, res) => {
    let user = req.user
    // console.log(user);
    if (user.firstName != null && user.lastName != null && (user.profilePic != null || user.googleProfilePic != null)) {
        res.redirect("/")
    } else {
        res.render("details");
    }
})


app.post("/profiledetails", upload.single('profilePic'), (req, res) => {
    // console.log("i am trying")

    // if(req.file)
    if (req.file) {
        var profilePic = fs.readFileSync(req.file.path);
    } else {
        var profilePic = fs.readFileSync("./public/Images/avatar.png");

    }

    profilePic = profilePic.toString("base64");
    User.findByIdAndUpdate(req.user._id, { $set: { profilePic: profilePic, firstName: req.body.fname, lastName: req.body.lname, username: req.body.email, name: `${req.body.fname} ${req.body.lname}`, profileUrl: `profile/${req.user._id}` } })
        .then(() => {
            if (fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                    if (err) throw err;
                });
            }
            res.redirect('/');
        })

})

app.post("/editprofiledetails", upload.single('profilePic'), async (req, res) => {
    console.log("i am trying to update")

    // if(req.file)
    if (req.isAuthenticated()) {
        const user = await User.findById(req.user._id);
        const formData = req.body;
        if (req.file) {
            user.profilePic = fs.readFileSync(req.file, 'base64');
        }
        if (formData.fname) {
            user.firstName = formData.fname;
        }
        if (formData.lname) {
            user.firstName = formData.fname;
        }
        if (formData.about) {
            user.about = formData.about;
        }
        var socials = ["linkedin", "twitter", "facebook", "instagram"]
        socials.forEach((media) => {
            if (formData[media]) {
                user.socials[media] = formData[media];
            }
        })

        user.save()
            .then((result) => {
                console.log("it is done")
                console.log(result)
                res.json({ status: true })
            })
            .catch((error) => {
                res.json({ status: false })
            })

    } else {
        res.redirect("/login")
    }
})


app.get("/api/getmyprofile", async (req, res) => {
    if (req.isAuthenticated()) {
        console.log("here");
        res.json(req.user);

    } else {
        res.redirect("/login")
    }

})

app.get("/profile/:id", (req, res) => {
    res.render("profile");
})
app.get("/api/profile/:id", async (req, res) => {
    const { id } = req.params
    var signedInUser = false
    var inSession = false
    if (req.isAuthenticated()) {
        signedInUser = await User.findById(req.user._id);
        console.log(signedInUser.name)
        inSession = true
    }
    User.findById(id).populate("posts")
        .then(user => {
            res.json({ user, signedInUser, inSession });
        })
})
app.post("/signup", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/profiledetails")
            });
        }
    })

})

app.post("/login", (req, res) => {
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
                // console.log(previousUrl)
                res.redirect(previousUrl);
            })
        }
    })
})
app.get("/createpost", (req, res) => {
    if (req.isAuthenticated()) {

    } else {
        res.redirect("/login")
    }
})

app.get("/api/reviews", (req, res) => {
    Review.find({})
        .then((reviews) => {
            res.json(reviews);
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

// function populateDb() {
//     let person = "Maya Patel"
//     let comment = "As a journalist and writer, I find Sorosoke to be an invaluable resource for staying informed and up-to-date on the latest news and trends. The site's articles are consistently well-researched and thoughtfully written, and I appreciate the variety of topics covered. Sorosoke is a must-read for anyone who cares about social justice and progressive values."


//     let chosenImage = "./public/Images/pexels-andrea-piacquadio-3781530.jpg"
//     let reviewImage = fs.readFileSync(chosenImage, "base64")
//     const review = new Review({
//         person, comment, reviewImage
//     })
//     review.save();

// }