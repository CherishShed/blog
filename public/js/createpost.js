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

const Profile = await userController.createPost();
if (Profile.inSession) {
    $('.logout').css('display', 'flex');
} else {
    $('.get-started').css('display', 'block');
    $('.profile-nav').css('display', 'none');

}
// Assuming you have a Trix editor element with an id of "my-editor"


if (Profile.signedInUser) {

    if (Profile.signedInUser.profilePic != "") {
        var profilePicture = Profile.signedInUser.profilePic;
        $("#profile-pic").attr('src', "data:image/png;base64," + profilePicture)
    } else if (Profile.signedInUser.googleProfilePic != "") {
        var profilePicture = Profile.signedInUser.googleProfilePic;
        $("#profile-pic").attr('src', profilePicture)
    }
    $("#profile-name").text(Profile.signedInUser.firstName);
    $(".myProfile").attr("href", Profile.signedInUser.profileUrl)
    // Store the user details in sessionStorage
    sessionStorage.setItem("user", JSON.stringify(Profile.signedInUser));


}

$("#coverImage").change(function (event) {
    if (event.target.files.length > 0) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            $(".cover-image").attr("src", reader.result);
        }

        reader.readAsDataURL(file);
    }
});

$(".submit").click(function () {
    $("#createForm").submit()
})

$("#createForm").submit(function (event) {
    // Prepare the form data
    event.preventDefault();

    const formData = new FormData(this);

    // Perform the POST request
    fetch('/api/createpost', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {

            if (data.status) {

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

                $("#modelId").modal("hide");
                $('.toast').toast({ delay: 2000 })
                $(".toast-header").text("Failed");
                $(".toast-text").text("An eror occured")
                $(".toast").css("background-color", "red")
                $('.toast').toast('show');
            }
        })
        ;
});

const tags = await postController.fetchTags();
tags.forEach((tag) => {
    let tagLabel = $("<label></label>")
    let tagCheck = $(`<input type='checkbox' name='tags' value='${tag.name}'></label>`);
    $(tagLabel).append(tagCheck);
    $(tagLabel).append(tag.name)
    $(".tag-selector").append(tagLabel);
})

$('input[name="tags"]').change(function () {
    // Handle checkbox change event
    if (document.querySelectorAll('input[name="tags"]:checked').length >= 3) {
        document.querySelectorAll('input[name="tags"]:not(:checked)').forEach((box) => {
            box.setAttribute('disabled', true);
        })
    } else {
        document.querySelectorAll('input[name="tags"]:not(:checked)').forEach((box) => {
            box.removeAttribute('disabled');
        })
    }

});
