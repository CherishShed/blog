import userController from "./userCotroller.js"


var data = await userController.getMyProfile()
function fillPresentDetails(data) {
    console.log(data)
    if (data.firstName != "") {
        $("#fname").prop("disabled", true)
        $("#fname").val(data.firstName)
    }
    if (data.lastName != "") {
        $("#lname").prop("disabled", true)
        $("#lname").val(data.lastName)
    }
    if (data.username != "") {
        $("#emailaddress").prop("disabled", true)
        $("#emailaddress").val(data.username)
    }

}
fillPresentDetails(data[0]);