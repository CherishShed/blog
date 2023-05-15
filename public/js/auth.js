import postController from "./js/postController.js";

const reviews = await postController.fetchReviews();
// console.log(reviews);
reviews.forEach((review) => {
    // console.log(review)
    let carouselItem = $("<div></div>");
    $(carouselItem).addClass("carousel-item");
    let carouselImage = $("<img></img>");
    $(carouselImage).attr('src', "data:image/png;base64," + review.reviewImage);
    let carouselCaption = $("<div></div>");
    $(carouselCaption).addClass("carousel-caption");
    let comment = $("<h5></h5>").html(`<span>"</span><br>${review.comment}`)
    $(comment).addClass("comment");
    let author = $("<h5></h5>").text(review.person)
    $(author).addClass("author");

    $(carouselCaption).append(comment, author);
    $(carouselItem).append(carouselImage, carouselCaption);
    $(".carousel-inner").append(carouselItem);
    console.log("done");
});

// Activate Carousel
$("#myCarousel").carousel();
// Enable Carousel Controls
$(".carousel-control-prev").click(function () {
    $("#myCarousel").carousel("prev");
});
$(".carousel-control-next").click(function () {
    $("#myCarousel").carousel("next");
});


$($(".carousel-item")[0]).addClass("active");