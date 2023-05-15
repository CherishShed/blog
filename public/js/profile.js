import userController from "./userCotroller.js";
var postUrl = window.location.pathname;
console.log("api" + postUrl);


// $("#profile-name").text(post.signedInUser.firstName);
// console.log(authorOtherPosts);
// authorOtherPosts.forEach((post) => {
//     let blogDetails = $("<div></div>");
//     $(blogDetails).addClass("blog-details")
//     let blogImage = $("<div></div>");
//     $(blogImage).addClass("blog-image");
//     let overlay = $("<div></div>");
//     $(overlay).addClass("overlay");
//     let blogImageImg = $("<img></img>");
//     $(blogImageImg).attr('src', "data:image/png;base64," + post.coverImage);
//     let blogOwnerDets = $("<p></p>");
//     let blogDate = $("<span></span>").text(new Date(post.createdAt).toDateString());
//     $(blogOwnerDets).addClass("blog-date");
//     let blogAuthor = $("<span></span>").text(openPost.author.name);
//     console.log(post.author.name)
//     $(blogAuthor).addClass("blog-author");
//     $(blogOwnerDets).append(blogDate, blogAuthor);
//     $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


//     let blogText = $("<div></div>");
//     $(blogText).addClass("blog-text");
//     let blogTitle = $("<h5></h5>").text(post.title);
//     $(blogTitle).addClass("blog-title");
//     let blogDescriptionContainer = $("<div></div>");
//     $(blogDescriptionContainer).addClass("blog-description-container");
//     let blogDescription = $("<p></p>").text(post.description);
//     $(blogDescription).addClass("blog-description");
//     $(blogDescriptionContainer).append(blogDescription);
//     let blogTags = $("<div></div>");
//     $(blogTags).addClass("blog-tags");
//     post.tags.forEach((tag) => {
//         var tagDets = $("<p></p>").text(tag);
//         $(tagDets).addClass("tag btn btn-outline-dark")
//         $(blogTags).append(tagDets);
//     })
//     let viewMore = $("<a></a>").text("Read More ");
//     $(viewMore).addClass("redirect");
//     $(viewMore).attr("href", post.url);
//     let viewIcon = $("<i></i>");
//     $(viewIcon).addClass("fa-solid fa-arrow-right");
//     $(viewMore).append(viewIcon);
//     $(blogText).append(blogTitle, blogDescriptionContainer, blogTags, viewMore);
//     $(blogDetails).append(blogImage, blogText);

//     $(".more-posts").append(blogDetails);


//     const longText = $(blogDescription);
//     const maxHeight = 80; // Adjust this value to match the desired height
//     console.log(longText.outerHeight())


//     if (longText.outerHeight() > maxHeight) {
//         console.log("greater than max height")
//         while (longText.outerHeight() > maxHeight) {
//             console.log("still here")
//             longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
//         }
//     }