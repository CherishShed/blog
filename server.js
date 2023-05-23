require("dotenv").config();
const app = require('./Middleware/expressMiddleware');
const passport = require('./Middleware/authMiddleware');
const multer = require("multer");
const database = require("./Models/database.model");
const upload = multer({ dest: "uploads/" })
const userController = require("./Controllers/user.Controller");
const postController = require("./Controllers/post.Controller");
const authController = require("./Controllers/auth.Controller");
const User = database.User;
const Post = database.Post;
const Review = database.Review;

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

//Authentication APIs
app.get('/auth/google', authController.googleAuth);
app.get('/auth/google/blog', authController.googleAuthRedirect);
app.get("/login", authController.displayLogin);
app.get("/signup", authController.displaySignup);
app.post("/signup", authController.postSignup)
app.post("/login", authController.postLogin)

//user APIs
app.get("/profiledetails", userController.displayOriginalProfileDetails);
app.post("/profiledetails", upload.single('profilePic'), userController.editOriginalProfileDetails)
app.post("/editprofiledetails", upload.single('profilePic'), userController.editProfileDetails);
app.get("/api/getmyprofile", userController.getMyPofile);
app.get("/profile/:id", userController.displayProfile);
app.get("/api/profile/:id", userController.getPofileById);

//Post APIs
app.get("/createpost", postController.displayCreatePost);
app.get("/api/createpost", postController.checkSignedInUser);
app.post("/api/createpost", upload.single("coverImage"), postController.createPost);
app.get("/api/getallPosts", postController.getAllPosts);
app.get("/posts/:id", postController.displayPost);
app.get("/api/posts/:id", postController.getPostById);
app.get("/api/recentposts", postController.getRecentPosts);
app.get("/api/tags", postController.getTags);
app.get("/api/giveApplause", postController.giveApplause);


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

