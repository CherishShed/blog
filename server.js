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
const cheerio = require("cheerio");
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
    about: String,
    applaudedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogPost"
    }]
})

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    coverImage: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: { purifiedText: String, formatting: Object },
    url: String,
    tags: [String],
    applause: { type: Number, default: 0 }
}, { timestamps: true })

const reviewSchema = new mongoose.Schema({
    person: String,
    comment: String,
    reviewImage: String,
}, { timestamps: true })





userSchema.virtual('name').get(function () {
    return this.firstName + ' ' + this.lastName;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
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

        User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value, googleProfilePic: profile._json.picture, firstName: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
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

    Post.find({})
        .populate('author', 'firstName lastName profileUrl')
        .then((data) => {
            if (req.isAuthenticated()) {
                inSession = true
                User.findById(req.user._id)
                    .then((user) => {
                        console.log(user);
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
    console.log("in login")
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
    Post.findById(id).populate('author', 'firstName lastName profileUrl')
        .then((data) => {
            // console.log(data);
            // data.forEach((post) => {
            //     post.coverImage.data = post.coverImage.data.toString('base64');
            // })
            res.render('blog', { title: data.title });
        })
})
app.get("/api/posts/:id", async (req, res) => {
    console.log("we ae here now")
    const { id } = req.params
    var inSession = false
    var signedInUser = false
    if (req.isAuthenticated()) {
        inSession = true
        signedInUser = await User.findById(req.user._id);
    }
    // console.log(signedInUser)
    Post.findById(id).populate("author", "firstName  lastName profileUrl")
        .then((data) => {
            // console.log(data)
            // console.log(user);
            // Extract purified text and formatting metadata
            const { purifiedText, formatting } = data.content;

            // Generate HTML output based on the formatting metadata
            const formattedHTML = generateFormattedHTML(purifiedText, formatting);

            User.findById(data.author.id).populate("posts")
                .then((user) => {
                    res.json({ data, inSession, author: user, signedInUser, formattedHTML });
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
    User.findByIdAndUpdate(req.user._id, { $set: { profilePic: profilePic, firstName: toTitleCase(req.body.fname), lastName: toTitleCase(req.body.lname), username: req.body.email, profileUrl: `profile/${req.user._id}` } })
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
            user.profilePic = fs.readFileSync(req.file.path, 'base64');
        }
        if (formData.fname) {
            user.firstName = toTitleCase(formData.fname);
        }
        if (formData.lname) {
            user.lastName = toTitleCase(formData.lname);
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
        let user = await User.findById(req.user._id);
        res.json(user);

    } else {
        res.redirect("/login")
    }

})

app.get("/api/recentposts", async (req, res) => {
    let posts = await Post.find({}).populate("author", "firstName lastName profileUrl").sort({ createdAt: 'desc' });
    // console.log(posts);
    const shownRecentPosts = posts.slice(0, 7);
    res.json(shownRecentPosts);

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
            user.name = (user.name)
            res.json({ user, signedInUser, inSession });
        })
})
app.post("/signup", (req, res) => {
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
        res.render("createpost")
    } else {
        res.redirect("/login")
    }
})
app.get("/api/createpost", async (req, res) => {
    var signedInUser = false
    var inSession = false
    if (req.isAuthenticated()) {
        signedInUser = await User.findById(req.user._id);
        console.log(signedInUser.name)
        inSession = true
    }
    res.json({ inSession, signedInUser })
})
app.post("/api/createpost", upload.single("coverImage"), async (req, res) => {
    console.log("creating...")
    if (req.isAuthenticated()) {
        const user = await User.findById(req.user._id);
        var htmlContent = req.body.content
        // Create a new document in MongoDB
        const $ = cheerio.load(htmlContent);
        const purifiedText = $.text();
        const formatting = extractFormattingMetadata($);
        const content = {
            purifiedText,
            formatting
        };
        const formData = req.body;
        const newPost = new Post({
            title: formData.title,
            description: formData.description,
            coverImage: "",
            author: req.user._id,
            content: content,
            url: "",
            tags: ["Life", "Education"]
        });

        if (req.file) {
            newPost.coverImage = fs.readFileSync(req.file.path, 'base64');
        } else {
            newPost.coverImage = fs.readFileSync("./public/Images/pexels-jessica-lewis-creative-606541.jpg", 'base64');
        }

        newPost.save()
            .then((result) => {
                newPost.url = `/posts/${result._id}`
                newPost.save();
                user.posts.push(result._id);
                user.save();
                console.log(result);
                res.json({ status: true })
            })
            .catch((error) => {
                res.json({ status: false })
            })

    } else {
        res.redirect("/login");
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

app.get("/api/giveApplause", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                if (user.applaudedPosts.indexOf(req.query.postId) == -1) {
                    user.applaudedPosts.push(req.query.postId)
                    await user.save();

                    try {
                        const post = await Post.findById(req.query.postId);
                        if (post) {

                            post.applause += 1;
                            await post.save()
                            res.json({ message: "Done adding like" });
                        }
                    } catch (err) {
                        res.status(404).send("Not found")
                    }
                } else {
                    var newArray = user.applaudedPosts.slice();
                    newArray.splice(user.applaudedPosts.indexOf(req.query.postId), 1);
                    user.applaudedPosts = newArray;
                    user.save();
                    try {
                        const post = await Post.findById(req.query.postId);
                        if (post) {
                            post.applause -= 1;
                            await post.save()
                            res.json({ message: "Done removing like" });
                        }
                    } catch (err) {
                        res.status(404).send("Not found")
                    }
                }

            } else {
                res.status(404).send("Not found")
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        res.json({ message: "no user" })
    }
})
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("listening on port " + PORT);
})




function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
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

// Function to extract formatting metadata from the HTML content
// Function to extract formatting metadata from the HTML content
function extractFormattingMetadata(htmlContent) {
    const formatting = {
        bold: [],
        italics: [],
        headers: []
    };

    // Load the HTML content using cheerio
    const $ = cheerio.load(htmlContent);

    // Extract bold formatting
    $('strong, b').each((index, element) => {
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length;
        formatting.bold.push({ startIndex, endIndex });
    });

    // Extract italics formatting
    $('em, i').each((index, element) => {
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length;
        formatting.italics.push({ startIndex, endIndex });
    });

    // Extract header formatting
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const headerLevel = parseInt($(element).prop('tagName').substring(1));
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length;
        formatting.headers.push({ level: headerLevel, startIndex, endIndex });
    });

    return formatting;
}

// Function to generate formatted HTML using the purified text and formatting metadata
function generateFormattedHTML(purifiedText, formatting) {
    let formattedHTML = purifiedText;

    // Apply bold formatting
    formatting.bold.forEach(({ startIndex, endIndex }) => {
        formattedHTML = insertTag(formattedHTML, '<strong>', startIndex);
        formattedHTML = insertTag(formattedHTML, '</strong>', endIndex + 8);
    });

    // Apply italics formatting
    formatting.italics.forEach(({ startIndex, endIndex }) => {
        formattedHTML = insertTag(formattedHTML, '<em>', startIndex);
        formattedHTML = insertTag(formattedHTML, '</em>', endIndex + 5);
    });

    // Apply header formatting
    formatting.headers.forEach(({ level, startIndex, endIndex }) => {
        const headerTag = `h${level}`;
        formattedHTML = insertTag(formattedHTML, `<${headerTag}>`, startIndex);
        formattedHTML = insertTag(formattedHTML, `</${headerTag}>`, endIndex + headerTag.length + 3);
    });

    return formattedHTML;
}

// Helper function to insert a tag into a string at a specific index
function insertTag(originalString, tag, index) {
    return originalString.slice(0, index) + tag + originalString.slice(index);
}

// Example usage
const htmlContent = '<p>This is <strong>bold</strong> and <em>italics</em> text. <h2>Header 2</h2></p>';

const formatting = extractFormattingMetadata(htmlContent);
console.log(formatting);

const purifiedText = cheerio.load(htmlContent).text();
console.log(purifiedText);

const formattedHTML = generateFormattedHTML(purifiedText, formatting);
console.log(formattedHTML);
