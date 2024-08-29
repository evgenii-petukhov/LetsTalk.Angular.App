import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { StoreService } from './store.service';
import { ApiService } from './api.service';
import { FileStorageService } from './file-storage.service';
import { chatsActions } from '../state/chats/chats.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { imagesActions } from '../state/images/images.actions';
import {
    IChatDto,
    IProfileDto,
    IMessageDto,
    IImagePreviewDto,
    ILinkPreviewDto,
} from '../api-client/api-client';
import { Image } from '../models/image';
import { accountsActions } from '../state/accounts/accounts.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { ILayoutSettings } from '../models/layout-settings';
import { layoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { selectedChatIdActions } from '../state/selected-chat/selected-chat-id.actions';
import { viewedImageIdActions } from '../state/viewed-image-id/viewed-image-id.actions';

describe('StoreService', () => {
    let service: StoreService;
    let store: jasmine.SpyObj<Store>;
    let apiService: jasmine.SpyObj<ApiService>;
    let fileStorageService: jasmine.SpyObj<FileStorageService>;

    const message: IMessageDto = {
        id: '1',
        chatId: 'chatId',
        created: 1724872378,
        imageId: 'imageId',
        isMine: true,
        text: 'test',
        textHtml: '<p>test</p>',
    };

    const account: IProfileDto = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        id: 'profileId',
        imageId: 'imageId',
    };

    beforeEach(() => {
        store = jasmine.createSpyObj('Store', ['dispatch', 'select']);
        apiService = jasmine.createSpyObj('ApiService', [
            'markAsRead',
            'getChats',
            'getAccounts',
            'getProfile',
        ]);
        fileStorageService = jasmine.createSpyObj('FileStorageService', [
            'download',
        ]);

        TestBed.configureTestingModule({
            providers: [
                StoreService,
                { provide: Store, useValue: store },
                { provide: ApiService, useValue: apiService },
                { provide: FileStorageService, useValue: fileStorageService },
            ],
        });

        service = TestBed.inject(StoreService);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        fileStorageService = TestBed.inject(
            FileStorageService,
        ) as jasmine.SpyObj<FileStorageService>;
    });

    describe('markAllAsRead', () => {
        it('should mark all messages as read and update the unread count', async () => {
            const chat: IChatDto = {
                id: '1',
                unreadCount: 2,
                lastMessageId: '123',
                lastMessageDate: 1234567890,
            };

            apiService.markAsRead.and.returnValue(Promise.resolve());

            await service.markAllAsRead(chat);

            expect(apiService.markAsRead).toHaveBeenCalledWith(
                chat.id,
                chat.lastMessageId,
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.setUnreadCount({
                    chatId: chat.id,
                    unreadCount: 0,
                }),
            );
        });
    });

    describe('initChatStorage', () => {
        it('should initialize chat storage with API response if force is true', async () => {
            const mockChats = [{ id: '1' }] as IChatDto[];
            apiService.getChats.and.returnValue(Promise.resolve(mockChats));

            await service.initChatStorage(true);

            expect(apiService.getChats).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.init({ chats: mockChats }),
            );
        });

        it('should initialize chat storage with store value if force is false', async () => {
            const mockChats = [{ id: '1' }] as IChatDto[];
            store.select.and.returnValue(of(mockChats));

            await service.initChatStorage(false);

            expect(apiService.getChats).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should initialize chat storage with API response if store is empty and force is false', async () => {
            const mockChats = [{ id: '1' }] as IChatDto[];
            store.select.and.returnValue(of(null));
            apiService.getChats.and.returnValue(Promise.resolve(mockChats));

            await service.initChatStorage(false);

            expect(apiService.getChats).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.init({ chats: mockChats }),
            );
        });
    });

    describe('initAccountStorage', () => {
        it('should initialize account storage with store value if available', async () => {
            const mockAccounts = [account] as IProfileDto[];
            store.select.and.returnValue(of(mockAccounts));

            await service.initAccountStorage();

            expect(apiService.getAccounts).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should initialize account storage with API response if store is empty', async () => {
            const mockAccounts = [account] as IProfileDto[];
            store.select.and.returnValue(of(null));
            apiService.getAccounts.and.returnValue(
                Promise.resolve(mockAccounts),
            );

            await service.initAccountStorage();

            expect(apiService.getAccounts).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                accountsActions.init({ accounts: mockAccounts }),
            );
        });
    });

    describe('initMessages', () => {
        it('should dispatch init action for messages', () => {
            const messages: IMessageDto[] = [message];

            service.initMessages(messages);

            expect(store.dispatch).toHaveBeenCalledWith(
                messagesActions.init({ messageDtos: messages }),
            );
        });
    });

    describe('addMessages', () => {
        it('should dispatch addMessages action', () => {
            const messages: IMessageDto[] = [{ id: '1' }];

            service.addMessages(messages);

            expect(store.dispatch).toHaveBeenCalledWith(
                messagesActions.addMessages({ messageDtos: messages }),
            );
        });
    });

    describe('addMessage', () => {
        it('should dispatch addMessage action', () => {
            service.addMessage(message);

            expect(store.dispatch).toHaveBeenCalledWith(
                messagesActions.addMessage({ messageDto: message }),
            );
        });
    });

    describe('setLinkPreview', () => {
        it('should dispatch setLinkPreview action', () => {
            const linkPreview: ILinkPreviewDto = {
                url: 'http://example.com',
            };

            service.setLinkPreview(linkPreview);

            expect(store.dispatch).toHaveBeenCalledWith(
                messagesActions.setLinkPreview({ linkPreviewDto: linkPreview }),
            );
        });
    });

    describe('setImagePreview', () => {
        it('should dispatch setImagePreview action', () => {
            const imagePreview: IImagePreviewDto = {
                chatId: 'chatId',
                width: 100,
                height: 100,
            };

            service.setImagePreview(imagePreview);

            expect(store.dispatch).toHaveBeenCalledWith(
                messagesActions.setImagePreview({
                    imagePreviewDto: imagePreview,
                }),
            );
        });
    });

    describe('incrementUnreadMessages', () => {
        it('should dispatch incrementUnread action', () => {
            const chatId = '1';

            service.incrementUnreadMessages(chatId);

            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.incrementUnread({ chatId }),
            );
        });
    });

    describe('setLastMessageInfo', () => {
        it('should dispatch setLastMessageDate and setLastMessageId actions', () => {
            const chatId = '1';
            const date = Date.now();
            const id = 'lastMsgId';

            service.setLastMessageInfo(chatId, date, id);

            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.setLastMessageDate({ chatId, date }),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.setLastMessageId({ chatId, id }),
            );
        });
    });

    describe('updateChatId', () => {
        it('should dispatch updateChatId action', () => {
            const oldId = 'oldId';
            const newId = 'newId';

            service.updateChatId(oldId, newId);

            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.updateChatId({ chatId: oldId, newChatId: newId }),
            );
        });
    });

    describe('addChat', () => {
        it('should dispatch add action', () => {
            const chat: IChatDto = { id: '1' };

            service.addChat(chat);

            expect(store.dispatch).toHaveBeenCalledWith(
                chatsActions.add({ chatDto: chat }),
            );
        });
    });

    describe('setLayoutSettings', () => {
        it('should dispatch set action', () => {
            const layoutSettings: ILayoutSettings = {};

            service.setLayoutSettings(layoutSettings);

            expect(store.dispatch).toHaveBeenCalledWith(
                layoutSettingsActions.init({ settings: layoutSettings }),
            );
        });
    });

    describe('getLoggedInUser', () => {
        it('should return logged in user from store if exists', async () => {
            store.select.and.returnValue(of(account));

            const user = await service.getLoggedInUser();

            expect(user).toBe(account);
            expect(apiService.getProfile).not.toHaveBeenCalled();
        });

        it('should fetch logged in user from API if not in store', async () => {
            store.select.and.returnValue(of(null));
            apiService.getProfile.and.returnValue(Promise.resolve(account));

            const user = await service.getLoggedInUser();

            expect(user).toBe(account);
            expect(apiService.getProfile).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                loggedInUserActions.init({ account }),
            );
        });
    });

    describe('getImageContent', () => {
        it('should return image from store if exists', async () => {
            const imageId = '1';
            const mockImage: Image = {
                imageId,
                content: 'url',
                width: 100,
                height: 100,
            };
            store.select.and.returnValue(of([mockImage]));

            const image = await service.getImageContent(imageId);

            expect(image).toBe(mockImage);
            expect(fileStorageService.download).not.toHaveBeenCalled();
        });

        it('should download image if not in store', async () => {
            const imageId = '1';
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', [
                'getContent',
                'getWidth',
                'getHeight',
            ]);
            const mockContent = new Uint8Array([97, 98, 99]); // 'abc' in Uint8Array
            mockResponse.getContent.and.returnValue(mockContent);
            mockResponse.getWidth.and.returnValue(100);
            mockResponse.getHeight.and.returnValue(100);

            store.select.and.returnValue(of([]));
            fileStorageService.download.and.returnValue(
                Promise.resolve(mockResponse),
            );
            const imageUrl = 'data:image/png;base64,...';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageId);

            expect(fileStorageService.download).toHaveBeenCalledWith(imageId);

            expect(store.dispatch).toHaveBeenCalledWith(
                imagesActions.add({
                    image: {
                        imageId,
                        content: imageUrl,
                        width: 100,
                        height: 100,
                    },
                }),
            );
            expect(image.imageId).toBe(imageId);
            expect(image.content).toBe(imageUrl);
        });
    });

    describe('setLoggedInUser', () => {
        it('should dispatch set action', () => {
            service.setLoggedInUser(account);

            expect(store.dispatch).toHaveBeenCalledWith(
                loggedInUserActions.set({ account }),
            );
        });
    });

    describe('setSelectedChatId', () => {
        it('should dispatch set action', () => {
            const chatId = '1';

            service.setSelectedChatId(chatId);

            expect(store.dispatch).toHaveBeenCalledWith(
                selectedChatIdActions.init({ chatId }),
            );
        });
    });

    describe('setViewedImageId', () => {
        it('should dispatch set action', () => {
            const imageId = '1';

            service.setViewedImageId(imageId);

            expect(store.dispatch).toHaveBeenCalledWith(
                viewedImageIdActions.init({ imageId }),
            );
        });
    });
});
