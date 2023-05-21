import userController from "./userCotroller.js";
var profileUrl = window.location.pathname;
// console.log(window.location);

const Profile = await userController.fetchUserProfile("api" + profileUrl);
// console.log(Profile);
if (Profile.inSession) {
    $('.logout').css('display', 'flex');
} else {

    $('.get-started').css('display', 'block');
    $('.profile-nav').css('display', 'none');

}
if (Profile.signedInUser) {

    if (Profile.signedInUser.profilePic != null) {
        var profilePicture = Profile.signedInUser.profilePic;
        $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
    } else if (Profile.signedInUser.googleProfilePic != null) {
        var profilePicture = Profile.signedInUser.googleProfilePic;
        $("#profile-pic").attr('src', profilePicture)
    }
    $("#profile-name").text(Profile.signedInUser.firstName);
    console.log(Profile.signedInUser.name)


}
function profileData(profile) {
    console.log(profile);

    if (Profile.signedInUser._id === profile._id) {
        console.log("it is")
        $(".edit").css("display", "block");
    }
    document.title = `${profile.firstName} ${profile.lastName}`;
    $("#profile-owner-pic").attr('src', "data:image/png;base64," + profile.profilePic);
    $("#profile-owner-name").text(profile.name);
    $("#about").text(profile.about);
    for (var i in profile.socials) {
        console.log(profile.socials[i]);
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
        console.log(post.author.name)
        $(blogAuthor).addClass("blog-author");
        $(blogOwnerDets).append(blogDate, blogAuthor);
        $(blogImage).append(overlay, blogImageImg, blogOwnerDets);


        let blogText = $("<div></div>");
        $(blogText).addClass("blog-text");
        let blogTitle = $("<a></a>").text(post.title);
        $(blogTitle).attr("href", post.url);
        $(blogTitle).addClass("blog-title");
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

        $(".user-posts").append(blogDetails);


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
}

setTimeout(function () {
    $(".preloader").css("display", "none");
}, 2000)
profileData(Profile.user);



function fillPresentDetails(data) {
    console.log(data)
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

    if ((data.profilePic) != null) {
        console.log(typeof (data.profilePic));
        $(".profile-image").attr("src", "data:image/png;base64," + data.profilePic)
        // $("#picfileInput").val(data.profilePic);
        console.log($("#picfileInput").val())
    } else if (data.googleProfilePic) {
        $(".profile-image").attr("src", data.googleProfilePic)
        // $("#picfileinput").val(data.googleProfilePicture);
        console.log($("#picfileInput").val())
    } else {
        // console.log("i am here")
        $(".profile-image").attr("src", "/Images/avatar.png")
        // $("#picfileinput").val("");
        console.log($("#picfileInput").val())
        // console.log("i am here")
    }


}

$("#picfileInput").change(function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        $(".profile-image").attr("src", reader.result);
    }

    reader.readAsDataURL(file);
})

$(".edit").click(function () {
    userController.getMyProfile()
        .then((data) => {
            console.log(data);
            fillPresentDetails(data);
        })
})

$(".submit").click(function () {
    $("#editForm").submit()
})

$("#editForm").submit(function (event) {
    // Prepare the form data
    event.preventDefault();
    console.log("goingggg")
    const formData = new FormData(this);

    // Perform the POST request
    fetch('/editprofiledetails', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log("hereeeee")
            if (data.status) {
                console.log("runnng");
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
                console.log("runnng not")
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