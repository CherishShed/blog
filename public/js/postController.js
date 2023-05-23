const postController = {
    fetchAllPosts: async function () {
        const response = await fetch("http://localhost:8081/api/getallPosts");
        const data = await response.json();
        return data;

    },
    fetchPostById: async function (url) {
        const response = await fetch("http://localhost:8081/" + url);
        const data = await response.json();
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
    },
    fetchTags: async function () {
        const response = await fetch("http://localhost:8081/api/tags");
        const data = await response.json();
        return data;
    }
}

export default (postController);