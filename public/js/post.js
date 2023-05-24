import postController from "./postController.js";
var postUrl = window.location.pathname;

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
            if (post.signedInUser.profilePic != "") {
                var profilePicture = post.signedInUser.profilePic;
                $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
            } else if (post.signedInUser.googleProfilePic != "") {
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
        let openPostContent = post.formattedHTML;
        $("#applause").data("postid", openPost._id);
        $("#applause-count").text(openPost.applause);
        if (post.signedInUser.applaudedPosts.indexOf(openPost._id) != -1) {
            $("#applause").addClass("done-action");
        }
        $(".post-hero-image img").attr("src", "data:image/png;base64," + openPost.coverImage);
        $("#open-post-title").text(openPost.title);
        $("#open-post-description").text(openPost.description);
        $("#open-post-author").text(openPost.author.name);
        $("#open-post-author").attr("href", "/" + post.author.profileUrl);
        $("#open-post-content ").html(openPostContent);

        //other posts by author
        if (post.author.posts.length > 3) {
            var authorOtherPosts = post.author.posts.slice(0, 3)
        } else {
            var authorOtherPosts = post.author.posts
        }
        if (post.author.profilePic != "") {
            var profilePicture = post.author.profilePic;
            $("#author-pic").attr('src', "data:image/png;base64," + profilePicture)
        } else if (post.author.googleProfilePic != "") {
            var profilePicture = post.author.googleProfilePic;
            $("#author-pic").attr('src', profilePicture)
        }
        $("#profile-name").text(post.signedInUser.firstName);

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
            if (longText.outerHeight() > maxHeight) {
                while (longText.outerHeight() > maxHeight) {
                    longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
                }
            }

        })
    });

setTimeout(function () {
    $(".preloader").fadeOut(300);
}, 3000)

$("#applause").click(function () {

    const postId = $(this).data("postid");
    fetch(`/api/giveApplause?postId=${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.message == "no user") {
                document.querySelector('.get-started').click()
            } else {
                $("#applause").toggleClass("done-action");
                if ($("#applause").hasClass("done-action")) {
                    let currentLike = parseInt($("#applause-count").text());
                    currentLike += 1;
                    $("#applause-count").text(currentLike)
                } else {
                    let currentLike = parseInt($("#applause-count").text());
                    currentLike -= 1;
                    $("#applause-count").text(currentLike)
                }

            }

        })
        ;
})
