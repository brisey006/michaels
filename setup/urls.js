module.exports = [
    /** USERS */
    {
        name: 'add-user',
        url: '/users/add'
    },
    {
        name: 'set-picture',
        url: '/users/set-picture/:id'
    },
    {
        name: 'crop-picture',
        url: '/users/crop-picture/:id'
    },
    {
        name: 'logout',
        url: '/users/logout'
    },
    {
        name: 'login',
        url: '/users/login'
    },
    {
        name: 'users',
        url: '/users/list/:userType/:page/:limit'
    },
    {
        name: 'users-students',
        url: '/users/students/:page/:limit'
    },
    {
        name: 'delete-user',
        url: '/users/delete/:id'
    },
    {
        name: 'edit-user',
        url: '/users/edit/:id'
    },
    {
        name: 'users-profile',
        url: '/users/profile/e/:id'
    },
    {
        name: 'generate-keys',
        url: '/users/generate-keys'
    },

    /** USER PROFILE */
    {
        name: 'user-profile',
        url: '/profile/me'
    },

    /** UNIVERSITIES */
    {
        name: "add-university",
        url: '/universities/add'
    },
    {
        name: 'set-university-logo',
        url: '/universities/set-picture/:id'
    },
    {
        name: 'crop-university-logo',
        url: '/universities/crop-picture/:id'
    },
    {
        name: 'universities',
        url: '/universities/list/:page/:limit'
    },
    {
        name: 'university',
        url: '/universities/e/:id'
    },
    {
        name: 'add-librarian-search',
        url: '/universities/librarian/search'
    },
    {
        name: 'add-librarian',
        url: '/universities/:id/add-librarian/:user'
    },
    {
        name: 'remove-librarian',
        url: '/universities/:id/remove-librarian/:user'
    },

    /** BOOKS */
    {
        name: 'add-book',
        url: '/books/add'
    },
    {
        name: 'set-book-cover',
        url: '/books/set-picture/:id'
    },
    {
        name: 'edit-book',
        url: '/books/edit/:slug'
    },
    {
        name: 'crop-book-cover',
        url: '/books/crop-picture/:id'
    },
    {
        name: 'book',
        url: '/books/e/:slug'
    },
    {
        name: 'books',
        url: '/books/list/:page/:limit'
    },
    {
        name: 'upload-book',
        url: '/books/upload-book/:id'
    },
    {
        name: 'download-book',
        url: '/books/download-book/:slug'
    }
];