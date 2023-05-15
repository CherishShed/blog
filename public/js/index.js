import postController from "./js/postController.js";

AOS.init({
    duration: 500,
    easing: "ease-in-out",
    once: true,
    mirror: false,
    delay: 0
});

function setMainHighlight() {
    postController.fetchAllPosts()
        .then((result) => {
            // console.log(result)
            if (result.inSession) {
                $('.get-started').css('display', 'none');
                $('.logout').css('display', 'flex');
            } else {
                $('.profile-nav').css('display', 'none');
            }
            if (result.signedInUser) {
                console.log(result.signedInUser);
                if (result.signedInUser.profilePic != null) {
                    console.log("in here")
                    var profilePicture = result.signedInUser.profilePic;
                    $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
                }
                else if (result.signedInUser.googleProfilePic != null) {
                    var profilePicture = result.signedInUser.googleProfilePic;
                    $("#profile-pic").attr('src', profilePicture)
                }

                // console.log(result.signedInUser);
                $("#profile-name").text(result.signedInUser.firstName);


            }
            let mainBlog = result.data[0];
            $("#main-highlight-image img").attr('src', "data:image/png;base64," + mainBlog.coverImage);
            let viewMore = $("<a></a>").text("Read More ");
            $(viewMore).addClass("redirect");
            $(viewMore).attr("href", mainBlog.url);
            let viewIcon = $("<i></i>");
            $(viewIcon).addClass("fa-solid fa-arrow-right");
            $(viewMore).append(viewIcon);
            $("#main-highlight-details").append(viewMore);
            $("#main-highlight-date").text(new Date(mainBlog.createdAt).toDateString());
            $("#main-highlight-blog-author").text(mainBlog.author.name);
            $("#main-highlight-title").text(mainBlog.title);
            $("#main-highlight-description").text(mainBlog.description);
            mainBlog.tags.forEach((tag) => {
                var tagDets = $("<p></p>").text(tag);
                $(tagDets).addClass("tag btn btn-outline-dark")
                $("#main-highlight-tags").append(tagDets);
            })
        })
}

function otherHighlights() {
    // console.log(result)
    postController.fetchAllPosts()
        .then((result) => {

            result.data.slice(1, 4).forEach((post) => {
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
                let blogAuthor = $("<span></span>").text(post.author.name);
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

                $(".other-highlights").append(blogDetails);

            })

        })
}

window.onload = function () {
    setMainHighlight();
    otherHighlights();
};