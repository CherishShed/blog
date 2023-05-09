import postController from "./postController.js";
var postUrl = window.location.pathname;
console.log("api" + postUrl);

postController.fetchPostById("api" + postUrl)
    .then((post) => {
        console.log("we are here");
        let openPost = post.data;
        $(".post-hero-image img").attr("src", "data:image/png;base64," + openPost.coverImage);
        $("#open-post-title").text(openPost.title);
        $("#open-post-description").text(openPost.description);
        $("#open-post-author").text(openPost.author);
    });