const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/blogDb", { useNewUrlParser: true });

const blogSchema = new mongoose.Schema({
    title: {
        type: "string",
        required: true
    },
    content: {
        type: "string",
        required: true
    },
    author: mongoose.ObjectID

}, { timestamps: true });
function getData() {
    return Fruit.find()
}

getData()
    .then(function (data) {
        console.log(data)
    })