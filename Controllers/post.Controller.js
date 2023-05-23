const database = require("../Models/database.model");
const User = database.User;
const fs = require('fs');
const Post = database.Post;
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
    }


}

module.exports = postController; 