export const environment = {
    production: false,
    login: {
        facebookAppId: '1167512300629881',
    },
    services: {
        api: {
            url: 'https://chatapi.epetukhov.cyou'
        },
        notifications: {
            url: 'https://chatnotifications.epetukhov.cyou/messagehub',
            connectionInterval: 5000
        },
        fileStorage: {
            url: 'https://chatfilestorage.epetukhov.cyou'
        }
    },
    imageSettings: {
        limits: {
            avatar: {
                width: 512,
                height: 512
            },
            picture: {
                width: 4000,
                height: 4000
            },
            picturePreview: {
                width: 150,
                height: 150
            },
        }
    }
};
