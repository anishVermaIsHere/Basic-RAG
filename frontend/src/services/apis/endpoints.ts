
export const API_ENDPOINTS = {
    USER: {
        me: "/self"
    },
    AUTH: {
        login: "/auth/login",
        logout: "/auth/logout"
    },
    DOCUMENT: {
        upload: "/documents/upload/",
        all: "/documents",
        one: (id: string) => `/documents/${id}`
    },
    SOURCES: {
        all: "/sources"
    }
}

