const postController = {
    fetchAllPosts: async function () {
        const response = await fetch("http://localhost:8081/api/getallPosts");
        const data = await response.json();
        console.log(data)
        // data.data.author.name = `${data.data.author.firstName} ${data.data.author.lastName}`
        return data;

    },
    fetchPostById: async function (url) {
        const response = await fetch("http://localhost:8081/" + url);
        const data = await response.json();
        // data.data.author.name = `${data.data.author.firstName} ${data.data.author.lastName}`
        return data;

    },
    fetchReviews: async function () {
        const response = await fetch("http://localhost:8081/api/reviews");
        const data = await response.json();
        return data;
    },
    fetchRecentPosts: async function () {
        const response = await fetch("http://localhost:8081/api/recentposts");
        const data = await response.json();
        return data;
    }
}

export default (postController);