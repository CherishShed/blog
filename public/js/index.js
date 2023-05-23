import postController from "./postController.js";

AOS.init({
    duration: 500,
    easing: "ease-in-out",
    once: true,
    mirror: false,
    delay: 0
});

async function setMainHighlight() {
    postController.fetchAllPosts()
        .then((result) => {

            if (result.inSession) {
                $('.logout').css('display', 'flex');
            } else {

                $('.get-started').css('display', 'block');
                $('.profile-nav').css('display', 'none');

            }
            if (result.signedInUser) {

                if (result.signedInUser.profilePic != null) {
                    var profilePicture = result.signedInUser.profilePic;
                    $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
                }
                else if (result.signedInUser.googleProfilePic != null) {
                    console.log("Google profile")
                    var profilePicture = result.signedInUser.googleProfilePic;
                    $("#profile-pic").attr('src', profilePicture)
                }


                $("#profile-name").text(result.signedInUser.firstName);
                $(".myProfile").attr("href", result.signedInUser.profileUrl)


            }
            let mainBlog = result.data[0];

            $("#main-highlight-image img").attr('src', "data:image/png;base64," + mainBlog.coverImage);
            $("#main-highlight-date").text(new Date(mainBlog.createdAt).toDateString());
            $("#main-highlight-blog-author").text(mainBlog.author.name);
            $("#main-highlight-blog-author").attr("href", mainBlog.author.profileUrl);
            $("#main-highlight-title").text(mainBlog.title);
            $("#main-highlight-title").attr("href", mainBlog.url);
            $("#main-highlight-description").text(mainBlog.description);
            mainBlog.tags.forEach((tag) => {
                var tagDets = $("<p></p>").text(tag);
                $(tagDets).addClass("tag btn btn-outline-dark")
                $("#main-highlight-tags").append(tagDets);
            })

            //other Highlights creation
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
                let blogAuthor = $("<a></a>").text(post.author.name);
                $(blogAuthor).addClass("blog-author");
                $(blogAuthor).attr("href", post.author.profileUrl);
                $(blogOwnerDets).append(blogDate, blogAuthor);
                $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


                let blogText = $("<div></div>");
                $(blogText).addClass("blog-text");
                let blogTitle = $("<a></a>").text(post.title);
                $(blogTitle).addClass("blog-title");
                $(blogTitle).attr("href", post.url);
                let blogDescription = $("<p></p>").text(post.description);
                $(blogDescription).addClass("blog-description");
                let blogTags = $("<div></div>");
                $(blogTags).addClass("blog-tags");
                post.tags.forEach((tag) => {
                    var tagDets = $("<p></p>").text(tag);
                    $(tagDets).addClass("tag btn btn-outline-dark")
                    $(blogTags).append(tagDets);
                })


                $(blogText).append(blogTitle, blogDescription, blogTags);
                $(blogDetails).append(blogImage, blogText);

                $(".other-highlights").append(blogDetails);
                const longText = $(blogDescription);
                const maxHeight = 65;
                if (longText.outerHeight() > maxHeight) {
                    while (longText.outerHeight() > maxHeight) {
                        longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
                    }
                }
            })


        })
}


async function recentPosts() {
    //Recent Posts
    const RecentPosts = await postController.fetchRecentPosts();
    RecentPosts.forEach((post) => {
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
        let blogAuthor = $("<a></a>").text(post.author.name);
        $(blogAuthor).addClass("blog-author");
        $(blogAuthor).attr("href", post.author.profileUrl);

        $(blogOwnerDets).append(blogDate, blogAuthor);
        $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


        let blogText = $("<div></div>");
        $(blogText).addClass("blog-text");
        let blogTitle = $("<a></a>").text(post.title);
        $(blogTitle).addClass("blog-title");
        $(blogTitle).attr("href", post.url);
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

        $(".other-posts").append(blogDetails);


        const longText = $(blogDescription);
        const maxHeight = 70; // Adjust this value to match the desired height


        if (longText.outerHeight() > maxHeight) {

            while (longText.outerHeight() > maxHeight) {
                longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
            }
        }

    })
}


// function otherHighlights() {
//     // console.log(result)
//     postController.fetchAllPosts()
//         .then((result) => {



//         })
// }


window.onload = async function () {
    await setMainHighlight();
    await recentPosts();
    setTimeout(function () {
        $(".preloader").fadeOut(300);
    }, 1000)
    // otherHighlights();
};