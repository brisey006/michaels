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
        name: 'logout',
        url: '/users/logout'
    },
    {
        name: 'users',
        url: '/users/list/:userType/:page/:limit'
    },
    {
        name: 'delete-user',
        url: '/users/delete/:id'
    },
    {
        name: 'edit-user',
        url: '/users/edit/:id'
    },

    /** USER PROFILE */
    {
        name: 'user-profile',
        url: '/profile/me'
    }
];