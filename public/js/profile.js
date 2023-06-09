import userController from "./userCotroller.js";
var profileUrl = window.location.pathname;
// 
const Profile = await userController.fetchUserProfile("api" + profileUrl);
if (Profile.inSession) {
    $('.logout').css('display', 'flex');
} else {

    $('.get-started').css('display', 'block');
    $('.profile-nav').css('display', 'none');

}
if (Profile.signedInUser) {

    if (Profile.signedInUser.profilePic != "") {
        var profilePicture = Profile.signedInUser.profilePic;
        $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
    } else if (Profile.signedInUser.googleProfilePic != "") {
        var profilePicture = Profile.signedInUser.googleProfilePic;
        $("#profile-pic").attr('src', profilePicture)
    }
    $("#profile-name").text(Profile.signedInUser.firstName);



}
function profileData(profile) {

    if (Profile.signedInUser._id === profile._id) {

        $(".edit").css("display", "block");
    }
    document.title = `${profile.firstName} ${profile.lastName}`;
    if (profile.profilePic != "") {
        var profilePicture = profile.profilePic;
        $("#profile-owner-pic").attr('src', "data:image/png;base64," + profilePicture)
    } else if (profile.googleProfilePic != "") {
        var profilePicture = profile.googleProfilePic;
        $("#profile-owner-pic").attr('src', profilePicture)
    }
    $("#profile-owner-name").text(profile.name);
    $("#about").text(profile.about);
    for (var i in profile.socials) {

        if (profile.socials[i] != null) {
            let socialText = $("<i></i>");
            let socialLink = $("<a></a>");
            $(socialText).addClass(`fa fa-${i}`);
            $(socialLink).attr("href", profile.socials[i])
            $(socialLink).append(socialText);
            $(socialLink).attr("target", "blank");
            $(".socials").append(socialLink);

            $(".title").text(profile.name);
        }
    }
    profile.posts.forEach((post) => {
        $(".no-value").css("display", "none");
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
        let blogTitleContainer = $("<div></div>");
        $(blogTitleContainer).addClass("blog-title-container");
        let blogTitle = $("<a></a>").text(post.title);
        $(blogTitle).addClass("blog-title");
        $(blogTitle).attr("href", post.url);
        $(blogTitleContainer).append(blogTitle);
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

        $(blogText).append(blogTitleContainer, blogDescriptionContainer, blogTags);
        $(blogDetails).append(blogImage, blogText);

        $(".user-posts").append(blogDetails);


        const longText = $(blogDescription);
        const otherlongText = $(blogTitle);

        const maxHeight = 70;

        if (longText.outerHeight() > maxHeight) {

            while (longText.outerHeight() > maxHeight) {
                longText.text(longText.text().replace(/\W*\s(\S)*$/, '...'));
            }
            while (otherlongText.outerHeight() > maxHeight) {
                otherlongText.text(otherlongText.text().replace(/\W*\s(\S)*$/, '...'));
            }
        }

    })
}

setTimeout(function () {
    $(".preloader").css("display", "none");
}, 2000)
profileData(Profile.user);

$("#edit").click(fillPresentDetails(Profile.signedInUser))
function fillPresentDetails(data) {
    if (data.firstName != "" && data.firstName != null) {
        $("#fname").val(data.firstName)
    }
    if (data.lastName != "" && data.lastName != null) {
        $("#lname").val(data.lastName)
    }
    if (data.username != null && data.username != "") {
        $("#emailaddress").prop("disabled", true)
        $("#emailaddress").val(data.username)
    }
    if (data.about != null && data.about != "") {
        $("#aboutYou").val(data.about)
    }
    if (data.socials != null && data.socials != "") {
        for (var i in data.socials) {
            if (data.socials[i] != null) {
                $(`#${i}`).val(data.socials[i]);
            }
        }
    }
    if (data.profilePic != "") {
        var profilePicture = data.profilePic;
        $(".profile-image").attr('src', "data:image/png;base64," + profilePicture)
    } else if (data.googleProfilePic != "") {
        var profilePicture = data.googleProfilePic;
        $(".profile-image").attr('src', profilePicture)
    }

}

$("#picfileInput").change(function (event) {
    if (event.target.files.length > 0) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            $(".profile-image").attr("src", reader.result);
        }

        reader.readAsDataURL(file);
    }
})


$(".submit").click(function () {
    $("#editForm").submit()
})

$("#editForm").submit(function (event) {
    // Prepare the form data
    event.preventDefault();
    const formData = new FormData(this);

    // Perform the POST request
    fetch('/editprofiledetails', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                $("#modelId").modal("hide");
                $(".toast-text").text("Edited successfully")
                $(".toast-header").text("Succcess");
                $('.toast').toast({ delay: 2000 });
                $(".toast").css("background-color", "green")
                $('.toast').toast('show');
                $('.toast').on('hide.bs.toast', function () {
                    location.reload();
                });
            } else {

                $("#modelId").modal("hide");
                $('.toast').toast({ delay: 2000 })
                $(".toast-header").text("Failed");
                $(".toast-text").text("An eror occured")
                $(".toast").css("background-color", "red")
                $('.toast').toast('show');
                $('.toast').on('hide.bs.toast', function () {
                    location.reload();
                });
            }
        })
        ;
});


$('#exampleModal').on('show.bs.modal', event => {
    var button = $(event.relatedTarget);
    var modal = $(this);
    // Use above variables to manipulate the DOM

});