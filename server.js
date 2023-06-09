require("dotenv").config();
const app = require('./Middleware/expressMiddleware');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const userController = require("./Controllers/user.Controller");
const postController = require("./Controllers/post.Controller");
const authController = require("./Controllers/auth.Controller");
app.get("/", (req, res) => {
    res.render("index")

})
//Authentication APIs
app.get('/auth/google', authController.googleAuth);
app.get('/auth/google/blog', authController.googleAuthRedirect);
app.get("/login", authController.displayLogin);
app.get("/signup", authController.displaySignup);
app.post("/signup", authController.postSignup);
app.post("/login", authController.postLogin);
app.get("/logout", authController.logout);
app.get("/api/reviews", authController.getReviews);

//user APIs
app.get("/profiledetails", userController.displayOriginalProfileDetails);
app.post("/profiledetails", upload.single('profilePic'), userController.editOriginalProfileDetails);
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

