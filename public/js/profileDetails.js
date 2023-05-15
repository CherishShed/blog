import userController from "./userCotroller.js"


var data = await userController.getMyProfile()
function fillPresentDetails(data) {
    console.log(data)
    if (data.firstName != "" && data.firstName != null) {
        $("#fname").prop("disabled", true)
        $("#fname").val(data.firstName)
    }
    if (data.lastName != "" && data.lastName != null) {
        $("#lname").prop("disabled", true)
        $("#lname").val(data.lastName)
    }
    if (data.username != null && data.username != "") {
        $("#emailaddress").prop("disabled", true)
        $("#emailaddress").val(data.username)
    }

    if ((data.profilePic) != null) {
        console.log(typeof (data.profilePic));
        $(".profile-image").attr("src", "data:image/png;base64," + data.profilePic)
        $("#picfileInput").val(data.profilePic);
        console.log($("#picfileInput").val())
    } else if (data.googleProfilePic) {
        $(".profile-image").attr("src", data.googleProfilePic)
        $("#picfileinput").val(data.googleProfilePicture);
        console.log($("#picfileInput").val())
    } else {
        // console.log("i am here")
        $(".profile-image").attr("src", "/Images/avatar.png")
        $("#picfileinput").val("");
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
fillPresentDetails(data);