import postController from "./postController.js";
var postUrl = window.location.pathname;
console.log("api" + postUrl);

postController.fetchPostById("api" + postUrl)
    .then((post) => {
        if (post.inSession) {
            $('.logout').css('display', 'flex');
        } else {

            $('.get-started').css('display', 'flex');
        }
        console.log("we are here");
        let openPost = post.data;
        console.log(openPost)
        $(".post-hero-image img").attr("src", "data:image/png;base64," + openPost.coverImage);
        $("#open-post-title").text(openPost.title);
        $("#open-post-description").text(openPost.description);
        $("#open-post-author").text(openPost.author.name);
        $("#open-post-content ").text(openPost.content);

        //other posts by author
        if (post.author.posts.length > 3) {
            var authorOtherPosts = post.author.posts.slice(0, 3)
        } else {
            var authorOtherPosts = post.author.posts
        }
        console.log(authorOtherPosts);
        authorOtherPosts.forEach((post) => {
            let blogDetails = $("<div></div>");
            $(blogDetails).addClass("blog-details")
            let blogImage = $("<div></div>");
            $(blogImage).addClass("blog-image");
            let overlay = $("<div></div>");
            $(overlay).addClass("overlay");
            let blogImageImg = $("<img></img>");
            $(blogImageImg).attr('src', "data:image/png;base64," + post.coverImage);
            let blogOwnerDets = $("<p></p>");
            let blogDate = $("<span></span>").text(new Date(post.createdAt).toDateString());
            $(blogOwnerDets).addClass("blog-date");
            let blogAuthor = $("<span></span>").text(openPost.author.name);
            console.log(post.author.name)
            $(blogAuthor).addClass("blog-author");
            $(blogOwnerDets).append(blogDate, blogAuthor);
            $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


            let blogText = $("<div></div>");
            $(blogText).addClass("blog-text");
            let blogTitle = $("<h5></h5>").text(post.title);
            $(blogTitle).addClass("blog-title");
            let blogDescription = $("<p></p>").text(post.description);
            $(blogDescription).addClass("blog-description");
            let blogTags = $("<div></div>");
            $(blogTags).addClass("blog-tags");
            post.tags.forEach((tag) => {
                var tagDets = $("<p></p>").text(tag);
                $(tagDets).addClass("tag btn btn-outline-dark")
                $(blogTags).append(tagDets);
            })
            let viewMore = $("<a></a>").text("Read More ");
            $(viewMore).addClass("redirect");
            $(viewMore).attr("href", post.url);
            let viewIcon = $("<i></i>");
            $(viewIcon).addClass("fa-solid fa-arrow-right");
            $(viewMore).append(viewIcon);
            $(blogText).append(blogTitle, blogDescription, blogTags, viewMore);
            $(blogDetails).append(blogImage, blogText);

            $(".more-posts").append(blogDetails);

        })
    });

// postController.fetchAllPosts()
//     .then((result) => {
//         // console.log(result)

//     })