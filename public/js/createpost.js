setTimeout(function () {
    $(".preloader").fadeOut(300);
}, 4000)


AOS.init({
    duration: 500,
    easing: "ease-in-out",
    once: true,
    mirror: false,
    delay: 0
});

import userController from "./userCotroller.js";
var profileUrl = window.location.pathname;
// console.log(window.location);

const Profile = await userController.createPost();
console.log(Profile);
if (Profile.inSession) {
    $('.logout').css('display', 'flex');
} else {
    $('.get-started').css('display', 'block');
    $('.profile-nav').css('display', 'none');

}
// Assuming you have a Trix editor element with an id of "my-editor"


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
    const creatorId = Profile.signedInUser._id

}

$("#coverImage").change(function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        $(".cover-image").attr("src", reader.result);
    }

    reader.readAsDataURL(file);
});

$(".submit").click(function () {
    var text = (document.querySelector("trix-editor").editor.getDocument()).toString();
    console.log(text);
})


$("#createForm").submit(function (event) {
    // Prepare the form data
    event.preventDefault();
    console.log("goingggg")
    const formData = new FormData(this);

    // Perform the POST request
    fetch('/createpost', {
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
