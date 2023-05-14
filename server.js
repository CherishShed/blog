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
    name: String,
    firstName: String,
    lastName: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogPost"
    }],
    googleId: String,
    googleProfilePic: String,
    profilePic: String,
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




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("user", userSchema);
const Post = mongoose.model("blogPost", postSchema);
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
    if (req.isAuthenticated()) {
        inSession = true
        signedInUser = req.user;
    }
    Post.find({}).populate('author', 'name')
        .then((data) => {
            // console.log(user);
            // data.forEach((post) => {
            //     post.coverImage.data = post.coverImage.data.toString('base64');
            // })
            res.json({ data, inSession, signedInUser });
        })

})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get('/auth/google/blog', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user)
        User.findById(req.user.id)
            .then((user) => {
                if (user.firstName === "" || user.lastName === "" || (user.profilePic != "" || user.googleProfilePic != "")) {
                    res.redirect("/profiledetails");
                } else {
                    res.redirect("/")
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
        User.findById(req.user.id)
            .then((user) => {
                // console.log(user);
                res.redirect("/profiledetails");
            })
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
    Post.findById(id).populate("author", "name")
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
    console.log("i am trying")

    // if(req.file)
    if (req.file) {
        // console.log(req.file.path);
        var profilePic = fs.readFileSync(req.file.path);
    } else {
        // console.log("at all");
        var profilePic = fs.readFileSync("./public/Images/avatar.png");
        // console.log(profilePic);

    }
    profilePic = profilePic.toString("base64");
    // console.log("geting id")
    // console.log(req.user._id);
    // User.findById(req.user._id)
    //     .then((foundUser) => {
    //         console.log("finding person...")
    //         console.log(foundUser);
    //     })
    User.findByIdAndUpdate(req.user._id, { $set: { profilePic: profilePic, firstName: req.body.fname, lastName: req.body.lname, username: req.body.email, name: `${req.body.fname} ${req.body.lname}` } })
        .then(() => {
            if (fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                    if (err) throw err;
                    console.log('File deleted');
                    console.log("Already")
                });
                res.redirect('/');
            }

        })

})


app.get("/api/getmyprofile", (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(req.user);
        res.json(req.user);

    } else {
        res.redirect("/login")
    }

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
                // console.log(req.user)
                res.redirect("/profiledetails");
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
//     const baseUrl = "/posts/"
//     Post.find({})
//         .then((result) => {
//             result.forEach((post) => {
//                 post.url = baseUrl + post.id
//                 post.save();
//             })
//         })

// }