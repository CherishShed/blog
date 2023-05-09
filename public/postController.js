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

    }
}

export default (postController);