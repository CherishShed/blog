const userController = {
    getMyProfile: async function () {
        const response = await fetch("http://localhost:8081/api/getmyprofile");
        const data = await response.json();
        return data;

    },
    fetchUserProfile: async function (url) {
        const response = await fetch("http://localhost:8081/" + url);
        const data = await response.json();
        return data;

    },
    createPost: async function () {
        const response = await fetch("http://localhost:8081/api/createpost");
        const data = await response.json();
        return data;

    }
}

export default (userController);