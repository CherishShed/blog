import postController from "./postController.js";
var postUrl = window.location.pathname;
console.log("api" + postUrl);
console.log(window.location)

postController.fetchPostById("api" + postUrl)
    .then((post) => {
        if (post.inSession) {
            $('.logout').css('display', 'flex');
        } else {

            $('.get-started').css('display', 'block');
            $('.profile-nav').css('display', 'none');

        }
        if (post.signedInUser) {
            console.log(post.signedInUser.username)
            if (post.signedInUser.profilePic != null) {
                var profilePicture = post.signedInUser.profilePic;
                $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
            } else if (post.signedInUser.googleProfilePic != null) {
                var profilePicture = post.signedInUser.googleProfilePic;
                $("#profile-pic").attr('src', profilePicture)
            }
            $("#profile-name").text(post.signedInUser.firstName);
            $(".myProfile").attr("href", post.signedInUser.profileUrl)

            // Store the user details in sessionStorage
            sessionStorage.setItem("user", JSON.stringify(post.signedInUser));

        }
        console.log("we are here");
        let openPost = post.data;
        console.log(openPost)
        $("#applause").data("postid", openPost._id);
        $("#applause-count").text(openPost.applause);
        $(".post-hero-image img").attr("src", "data:image/png;base64," + openPost.coverImage);
        $("#open-post-title").text(openPost.title);
        $("#open-post-description").text(openPost.description);
        $("#open-post-author").text(openPost.author.name);
        $("#open-post-author").attr("href", "/" + post.author.profileUrl);
        console.log(post.author.profileUrl)
        $("#open-post-content ").text(openPost.content);

        //other posts by author
        if (post.author.posts.length > 3) {
            var authorOtherPosts = post.author.posts.slice(0, 3)
        } else {
            var authorOtherPosts = post.author.posts
        }
        if (post.author.profilePic != null) {
            var profilePicture = post.author.profilePic;
            $("#author-pic").attr('src', "data:image/png;base64," + profilePicture)
        } else if (post.author.googleProfilePic != null) {
            var profilePicture = post.author.googleProfilePic;
            $("#author-pic").attr('src', profilePicture)
        }
        $("#profile-name").text(post.signedInUser.firstName);
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
            let blogAuthor = $("<a></a>").text(openPost.author.name);
            $(blogAuthor).addClass("blog-author");
            $(blogAuthor).attr("href", "/" + openPost.author.profileUrl);

            $(blogOwnerDets).append(blogDate, blogAuthor);
            $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


            let blogText = $("<div></div>");
            $(blogText).addClass("blog-text");
            let blogTitle = $("<a></a>").text(post.title);
            $(blogTitle).addClass("blog-title");
            $(blogTitle).attr("href", post.url)
            let blogDescriptionContainer = $("<div></div>");
            $(blogDescriptionContainer).addClass("blog-description-container");
            let blogDescription = $("<p></p>").text(post.description);
            $(blogDescription).addClass("blog-description");
            $(blogDescriptionContainer).append(blogDescription);
            let blogTags = $("<div></div>");
            $(blogTags).addClass("blog-tags");
            post.tags.forEach((tag) => {
                var tagDets = $("<p></p>").text(tag);
                $(tagDets).addClass("tag btn btn-outline-dark")
                $(blogTags).append(tagDets);
            })

            $(blogText).append(blogTitle, blogDescriptionContainer, blogTags);
            $(blogDetails).append(blogImage, blogText);

            $(".more-posts").append(blogDetails);


            const longText = $(blogDescription);
            const maxHeight = 80; // Adjust this value to match the desired height
            console.log(longText.outerHeight())


            if (longText.outerHeight() > maxHeight) {
                console.log("greater than max height")
                while (longText.outerHeight() > maxHeight) {
                    console.log("still here")
                    longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
                }
            }

        })
    });

setTimeout(function () {
    $(".preloader").fadeOut(300);
}, 3000)

$("#applause").click(function () {
    console.log("i no sabi")
    const postId = $(this).data("postid");
    fetch(`/api/giveApplause?postId=${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.message == "no user") {
                console.log("No user found")
                document.querySelector('.get-started').click()
            } else {
                $("#applause").toggleClass("done-action");

            }

        })
        ;
})
// if () {
//     console.log("runnng");
//     $("#modelId").modal("hide");
//     $(".toast-text").text("Edited successfully")
//     $(".toast-header").text("Succcess");
//     $('.toast').toast({ delay: 2000 });
//     $(".toast").css("background-color", "green")
//     $('.toast').toast('show');
//     $('.toast').on('hide.bs.toast', function () {
//         location.reload();
//     })
// }