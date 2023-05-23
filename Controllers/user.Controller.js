const database = require("../Models/database.model");
const User = database.User;
const fs = require('fs');
const Post = database.Post;
const userController = {
    getProfileDetails: async (req, res) => {
        console.log("is too empty")
        let user = req.user
        // console.log(user);
        if (user.firstName != '' && user.lastName != '' && (user.profilePic != '' || user.googleProfilePic != '')) {
            const previousUrl = req.session.previousUrl || "/"
            console.log(previousUrl);
            res.redirect(previousUrl)
        } else {
            res.render("details");
        }
    },

    editOriginalProfileDetails: async (req, res) => {
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
                if (req.file) {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlink(req.file.path, (err) => {
                            if (err) throw err;
                        });
                    }
                }
                res.redirect('/');
            })

    },

    editProfileDetails: async (req, res) => {
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
    },


    getMyPofile: async (req, res) => {
        if (req.isAuthenticated()) {
            console.log("here");
            let user = await User.findById(req.user._id);
            res.json(user);

        } else {
            res.redirect("/login")
        }

    },

    getPofileById: async (req, res) => {
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
    }

}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
module.exports = userController;