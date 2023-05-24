require("dotenv").config();
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require("mongoose-findorcreate");

mongoose.connect("mongodb+srv://cshed2000:23022004Cherish!@blogdb.8ibopve.mongodb.net/?retryWrites=true&w=majority");
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogPost"
    }],
    googleId: String,
    googleProfilePic: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    profileUrl: String,
    socials: { linkedin: String, facebook: String, twitter: String, instagram: String },
    about: String,
    applaudedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogPost"
    }]
})

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
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

const tagSchema = new mongoose.Schema({
    name: String
})
userSchema.virtual('name').get(function () {
    return this.firstName + ' ' + this.lastName;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("user", userSchema);
const Post = mongoose.model("blogPost", postSchema);
const Review = mongoose.model("review", reviewSchema);
const Tag = mongoose.model("tag", tagSchema);

module.exports = { User, Post, Review, Tag };