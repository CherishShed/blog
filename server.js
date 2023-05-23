require("dotenv").config();
const app = require('./Middleware/expressMiddleware');
const fs = require('fs');
const passport = require('./Middleware/authMiddleware');
const multer = require("multer");
const cheerio = require("cheerio");
const database = require("./Models/database.model");
const upload = multer({ dest: "uploads/" })
const userController = require("./Controllers/user.Controller")
const postController = require("./Controllers/post.Controller")
const User = database.User;
const Post = database.Post;
const Review = database.Review;
const Tag = database.Tag;

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
                    );
            })
    } else {
        Post.find({})
            .then((post) => {
                res.render("index", { post })
            }
            );
    }
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

    if (req.isAuthenticated()) {

        User.findById(req.user.id)
            .then((user) => {
                if (user.firstName === "" || user.lastName === "" || (user.profilePic != "" && user.googleProfilePic != "")) {
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

app.get("/api/getallPosts", postController.getAllPosts)
app.get("/posts/:id", postController.displayPost)
app.get("/api/posts/:id", postController.getPostById)

app.get("/profiledetails", userController.displayOriginalProfileDetails);


app.post("/profiledetails", upload.single('profilePic'), userController.editOriginalProfileDetails)

app.post("/editprofiledetails", upload.single('profilePic'), userController.editProfileDetails);


app.get("/api/getmyprofile", userController.getMyPofile);
app.get("/profile/:id", (req, res) => {
    res.render("profile");
});
app.get("/api/profile/:id", userController.getPofileById);

app.get("/api/recentposts", async (req, res) => {
    let posts = await Post.find({}).populate("author", "firstName lastName profileUrl").sort({ createdAt: 'desc' });
    // console.log(posts);
    const shownRecentPosts = posts.slice(0, 7);
    res.json(shownRecentPosts);

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
                req.session.previousUrl = previousUrl;
                res.redirect("/profiledetails")
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
        console.log(htmlContent);
        // Create a new document in MongoDB
        const $ = cheerio.load(htmlContent);
        const purifiedText = cleanseHTML(htmlContent);
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
            tags: formData.tags
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

app.get("/api/tags", async (req, res) => {
    const tags = await Tag.find({});
    res.json(tags);
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





// function populateDb() {
//     const tags = [
//         'Technology',
//         'Travel',
//         'Food',
//         'Health',
//         'Fitness',
//         'Fashion',
//         'Art',
//         'Photography',
//         'Science',
//         'Business',
//         'Music',
//         'Sports',
//         'Movies',
//         'Books',
//         'Gaming',
//         'Lifestyle',
//         'DIY',
//         'Education',
//         'Nature',
//         'History'
//     ];
//     tags.forEach((tag) => {
//         const newTag = new Tag({
//             name: tag
//         })
//         newTag.save();
//     })

// }

// Function to extract formatting metadata from the HTML content
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
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.bold.push({ startIndex, endIndex });
    });

    // Extract italics formatting
    $('em, i').each((index, element) => {
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.italics.push({ startIndex, endIndex });
    });

    // Extract header formatting
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const headerLevel = parseInt($(element).prop('tagName').substring(1));
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.headers.push({ level: headerLevel, startIndex, endIndex });
    });

    return formatting;
}

// Function to generate formatted HTML using the purified text and formatting metadata
function applyFormatting(purifiedText, formatting) {
    let formattedText = purifiedText;

    // Apply bold formatting
    formatting.bold.forEach(({ startIndex, endIndex }) => {
        formattedText = formattedText.slice(0, startIndex) + '<strong>' + formattedText.slice(startIndex, endIndex + 1) + '</strong>' + formattedText.slice(endIndex + 1);
    });

    // Apply italics formatting
    formatting.italics.forEach(({ startIndex, endIndex }) => {
        formattedText = formattedText.slice(0, startIndex) + '<em>' + formattedText.slice(startIndex, endIndex + 1) + '</em>' + formattedText.slice(endIndex + 1);
    });

    // Apply header formatting
    formatting.headers.forEach(({ level, startIndex, endIndex }) => {
        const headerTag = 'h' + level;
        formattedText = formattedText.slice(0, startIndex) + '<' + headerTag + '>' + formattedText.slice(startIndex, endIndex + 1) + '</' + headerTag + '>' + formattedText.slice(endIndex + 1);
    });

    return formattedText;
}

function cleanseHTML(html) {
    const $ = cheerio.load(html);

    // Remove unwanted tags
    $('body')
        .find(':not(strong, b, em, i, h1, h2, h3, h4, h5, h6, p)')
        .each((index, element) => {
            $(element).replaceWith($(element).html());
        });

    // Remove unwanted attributes
    $('*').each((index, element) => {
        const attributes = $(element)[0].attribs;
        Object.keys(attributes).forEach((attr) => {
            if (!['src', 'href', 'alt'].includes(attr)) {
                $(element).removeAttr(attr);
            }
        });
    });

    return $.html();
}



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
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.bold.push({ startIndex, endIndex });
    });

    // Extract italics formatting
    $('em, i').each((index, element) => {
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.italics.push({ startIndex, endIndex });
    });

    // Extract header formatting
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const headerLevel = parseInt($(element).prop('tagName').substring(1));
        const startIndex = $(element).text().indexOf($(element).html());
        const endIndex = startIndex + $(element).html().length - 1;
        formatting.headers.push({ level: headerLevel, startIndex, endIndex });
    });

    return formatting;
}


// Example usage
const htmlContent = '<p>This is <strong>bold</strong> and <em>italics</em> text. <h2>Header 2</h2></p>';

const formatting = extractFormattingMetadata(htmlContent);
console.log(formatting);

const purifiedText = cheerio.load(htmlContent).text();
console.log(purifiedText);

