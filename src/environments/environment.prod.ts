export const environment = {
    production: true,
    login: {},
    services: {
        api: {
            url: 'https://chatapi{{suffix}}.epetukhov.cyou',
        },
        notifications: {
            url: 'https://chatnotifications{{suffix}}.epetukhov.cyou/messagehub',
            connectionInterval: 5000,
        },
        fileStorage: {
            url: 'https://chatfilestorage{{suffix}}.epetukhov.cyou',
        },
    },
    imageSettings: {
        limits: {
            avatar: {
                width: 512,
                height: 512,
            },
            picture: {
                width: 4000,
                height: 4000,
            },
            picturePreview: {
                width: 150,
                height: 150,
            },
        },
    },
};
