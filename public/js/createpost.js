import userController from "./userCotroller.js";
import postController from "./postController.js";

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
    $(".myProfile").attr("href", Profile.signedInUser.profileUrl)
    // Store the user details in sessionStorage
    sessionStorage.setItem("user", JSON.stringify(Profile.signedInUser));


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
    $("#createForm").submit()
})

$("#createForm").submit(function (event) {
    // Prepare the form data
    event.preventDefault();
    console.log("goingggg")
    const formData = new FormData(this);

    // Perform the POST request
    fetch('/api/createpost', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log("hereeeee")
            if (data.status) {
                console.log("runnng");
                $("#modelId").modal("hide");
                $(".toast-text").text("Posted")
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

const tags = await postController.fetchTags();
console.log(tags);
tags.forEach((tag) => {
    let tagLabel = $("<label></label>")
    let tagCheck = $(`<input type='checkbox' name='tags' value='${tag.name}'></label>`);
    $(tagLabel).append(tagCheck);
    $(tagLabel).append(tag.name)
    $(".tag-selector").append(tagLabel);
})

$('input[name="tags"]').change(function () {
    // Handle checkbox change event
    var disableOthers = false;
    if ($('input[name="tags"]:checked').length >= 3) {
        document.querySelectorAll('input[name="tags"]:not(:checked)').forEach((box) => {
            box.setAttribute('disabled', true);
        })
    }

    console.log('Selected values:', $('input[name="tags"]:not(:checked)').length);
});
