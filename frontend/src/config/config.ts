


const appConfig = {
    appName: "Look AI",
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    test: {
        email: import.meta.env.VITE_LOGIN_EMAIL,
        password: import.meta.env.VITE_LOGIN_PASSWORD
    }
};


export default appConfig;
