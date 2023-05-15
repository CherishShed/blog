import userController from "./userCotroller.js";
var profileUrl = window.location.pathname;
console.log("api" + profileUrl);

const profile = await userController.fetchUserProfile("api" + profileUrl);
console.log(profile);
if (profile.inSession) {
    $('.logout').css('display', 'flex');
} else {

    $('.get-started').css('display', 'flex');
    $('.profile-nav').css('display', 'none');

}
if (profile.signedInUser) {

    if (profile.signedInUser.profilePic != null) {
        var profilePicture = profile.signedInUser.profilePic;
        $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
    } else if (profile.signedInUser.googleProfilePic != null) {
        var profilePicture = profile.signedInUser.googleProfilePic;
        $("#profile-pic").attr('src', profilePicture)
    }
    $("#profile-name").text(profile.signedInUser.name);

}
function profileData(profile) {
    let blogDetails = $("<div></div>");
    $(blogDetails).addClass("blog-details")
    let blogImage = $("<div></div>");
    $(blogImage).addClass("blog-image");
    let overlay = $("<div></div>");
    $(overlay).addClass("overlay");
    let blogImageImg = $("<img></img>");
    $(blogImageImg).attr('src', "data:image/png;base64," + profile.coverImage);
    let blogOwnerDets = $("<p></p>");
    let blogDate = $("<span></span>").text(new Date(profile.createdAt).toDateString());
    $(blogOwnerDets).addClass("blog-date");
    let blogAuthor = $("<span></span>").text(openprofile.author.name);
    console.log(profile.author.name)
    $(blogAuthor).addClass("blog-author");
    $(blogOwnerDets).append(blogDate, blogAuthor);
    $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


    let blogText = $("<div></div>");
    $(blogText).addClass("blog-text");
    let blogTitle = $("<h5></h5>").text(profile.title);
    $(blogTitle).addClass("blog-title");
    let blogDescriptionContainer = $("<div></div>");
    $(blogDescriptionContainer).addClass("blog-description-container");
    let blogDescription = $("<p></p>").text(profile.description);
    $(blogDescription).addClass("blog-description");
    $(blogDescriptionContainer).append(blogDescription);
    let blogTags = $("<div></div>");
    $(blogTags).addClass("blog-tags");
    profile.tags.forEach((tag) => {
        var tagDets = $("<p></p>").text(tag);
        $(tagDets).addClass("tag btn btn-outline-dark")
        $(blogTags).append(tagDets);
    })
    let viewMore = $("<a></a>").text("Read More ");
    $(viewMore).addClass("redirect");
    $(viewMore).attr("href", profile.url);
    let viewIcon = $("<i></i>");
    $(viewIcon).addClass("fa-solid fa-arrow-right");
    $(viewMore).append(viewIcon);
    $(blogText).append(blogTitle, blogDescriptionContainer, blogTags, viewMore);
    $(blogDetails).append(blogImage, blogText);

    $(".more-profiles").append(blogDetails);


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
}

profileData(profile);