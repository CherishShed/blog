const database = require("../Models/database.model");
const User = database.User;
const fs = require('fs');
const Post = database.Post;
const Tag = database.Tag;
const postController = {
    getAllPosts: async (req, res) => {
        var inSession = false
        if (req.isAuthenticated()) {

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

    },
    displayPost: async (req, res) => {
        const { id } = req.params
        Post.findById(id).populate('author', 'firstName lastName profileUrl')
            .then((data) => {
                // console.log(data);
                // data.forEach((post) => {
                //     post.coverImage.data = post.coverImage.data.toString('base64');
                // })
                res.render('blog', { title: data.title });
            })
    },
    getPostById: async (req, res) => {
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
                const formattedHTML = applyFormatting(purifiedText, formatting)

                User.findById(data.author.id).populate("posts")
                    .then((user) => {
                        res.json({ data, inSession, author: user, signedInUser, formattedHTML });
                    })
            })
    },

    getRecentPosts: async (req, res) => {
        let posts = await Post.find({}).populate("author", "firstName lastName profileUrl").sort({ createdAt: 'desc' });
        // console.log(posts);
        const shownRecentPosts = posts.slice(0, 7);
        res.json(shownRecentPosts);

    },
    displayCreatePost: async (req, res) => {
        if (req.isAuthenticated()) {
            res.render("createpost")
        } else {
            res.redirect("/login")
        }
    },
    checkSignedInUser: async (req, res) => {
        var signedInUser = false
        var inSession = false
        if (req.isAuthenticated()) {
            signedInUser = await User.findById(req.user._id);
            console.log(signedInUser.name)
            inSession = true
        }
        res.json({ inSession, signedInUser })
    },
    createPost: async (req, res) => {
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

    },

    getTags: async (req, res) => {
        const tags = await Tag.find({});
        res.json(tags);
    }


}

module.exports = postController; 