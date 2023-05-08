AOS.init({
    duration: 500,
    easing: "ease-in-out",
    once: true,
    mirror: false,
    delay: 0
});


async function fetchData() {
    const response = await fetch("http://localhost:8081/api/getallPosts");
    const data = await response.json();
    return data;

}
fetchData()
    .then((data) => {
        console.log(data)
        $("#main-highlight-image img").attr('src', "data:image/png;base64," + data[0].coverImage);
    })
