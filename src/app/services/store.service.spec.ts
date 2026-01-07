/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { StoreService } from './store.service';
import { ApiService } from './api.service';
import { FileStorageService } from './file-storage.service';
import { chatsActions } from '../state/chats/chats.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { imageCacheActions } from '../state/image-cache/image-cache.actions';
import {
    IChatDto,
    IProfileDto,
    IMessageDto,
    IImagePreviewDto,
    ILinkPreviewDto,
    IImageDto,
    ImageDto,
} from '../api-client/api-client';
import { ImageCacheEntry } from '../models/image-cache-entry';
import { accountsActions } from '../state/accounts/accounts.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { selectedChatIdActions } from '../state/selected-chat/selected-chat-id.actions';
import { videoCallActions } from '../state/video-call/video-call.actions';
import { selectedChatUiActions } from '../state/selected-chat-ui/selected-chat-ui.actions';

describe('StoreService', () => {
    let service: StoreService;
    let store: jasmine.SpyObj<Store>;
    let apiService: jasmine.SpyObj<ApiService>;
    let fileStorageService: jasmine.SpyObj<FileStorageService>;

    const imageKey: IImageDto = {
        id: 'image-id',
        fileStorageTypeId: 1,
    };

    const image = new ImageDto(imageKey);

    const message: IMessageDto = {
        id: '1',
        chatId: 'chatId',
        created: 1724872378,
        image: image,
        isMine: true,
        text: 'test',
        textHtml: '<p>test</p>',
    };

    const account: IProfileDto = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        id: 'profileId',
        image: new ImageDto({
            id: 'imageId',
            fileStorageTypeId: 1
        }),
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

            apiService.markAsRead.and.resolveTo();

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
            apiService.getChats.and.resolveTo(mockChats);

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
            apiService.getChats.and.resolveTo(mockChats);

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
            apiService.getAccounts.and.resolveTo(mockAccounts);

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

    describe('isChatIdValid', () => {
        it('should return true if chat ID exists in store', async () => {
            const mockChats = [
                { id: '1' },
                { id: '2' },
                { id: '3' }
            ] as IChatDto[];
            store.select.and.returnValue(of(mockChats));

            const result = await service.isChatIdValid('2');

            expect(result).toBe(true);
        });

        it('should return false if chat ID does not exist in store', async () => {
            const mockChats = [
                { id: '1' },
                { id: '2' },
                { id: '3' }
            ] as IChatDto[];
            store.select.and.returnValue(of(mockChats));

            const result = await service.isChatIdValid('nonexistent');

            expect(result).toBe(false);
        });

        it('should return false if chats array is null', async () => {
            store.select.and.returnValue(of(null));

            const result = await service.isChatIdValid('1');

            expect(result).toBe(false);
        });

        it('should return false if chats array is undefined', async () => {
            store.select.and.returnValue(of(undefined));

            const result = await service.isChatIdValid('1');

            expect(result).toBe(false);
        });

        it('should return false if chats array is empty', async () => {
            store.select.and.returnValue(of([]));

            const result = await service.isChatIdValid('1');

            expect(result).toBe(false);
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
            apiService.getProfile.and.resolveTo(account);

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
            const mockImage: ImageCacheEntry = {
                imageId: imageKey.id,
                content: 'url',
                width: 100,
                height: 100,
            };
            store.select.and.returnValue(of([mockImage]));

            const image = await service.getImageContent(imageKey);

            expect(image).toBe(mockImage);
            expect(fileStorageService.download).not.toHaveBeenCalled();
        });

        it('should download image if not in store', async () => {
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
            fileStorageService.download.and.resolveTo(mockResponse);
            const imageUrl = 'data:image/png;base64,...';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageKey);

            expect(fileStorageService.download).toHaveBeenCalledWith(imageKey);

            expect(store.dispatch).toHaveBeenCalledWith(
                imageCacheActions.add({
                    image: {
                        imageId: imageKey.id,
                        content: imageUrl,
                        width: 100,
                        height: 100,
                    },
                }),
            );
            expect(image.imageId).toBe(imageKey.id);
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

    describe('initOutgoingCall', () => {
        it('should dispatch initOutgoingCall action', () => {
            const chatId = '1';

            service.initOutgoingCall(chatId);

            expect(store.dispatch).toHaveBeenCalledWith(
                videoCallActions.initOutgoingCall({ chatId }),
            );
        });
    });

    describe('initIncomingCall', () => {
        it('should dispatch initIncomingCall action', () => {
            const chatId = '1';
            const offer = 'sdp-offer-string';

            service.initIncomingCall(chatId, offer);

            expect(store.dispatch).toHaveBeenCalledWith(
                videoCallActions.initIncomingCall({ chatId, offer }),
            );
        });
    });

    describe('resetCall', () => {
        it('should dispatch reset action', () => {
            service.resetCall();

            expect(store.dispatch).toHaveBeenCalledWith(
                videoCallActions.reset(),
            );
        });
    });

    describe('toggleVideo', () => {
        it('should dispatch toggleVideo action', () => {
            service.toggleVideo();

            expect(store.dispatch).toHaveBeenCalledWith(
                videoCallActions.toggleVideo(),
            );
        });
    });

    describe('toggleAudio', () => {
        it('should dispatch toggleAudio action', () => {
            service.toggleAudio();

            expect(store.dispatch).toHaveBeenCalledWith(
                videoCallActions.toggleAudio(),
            );
        });
    });

    describe('setSelectedChatMessageListStatus', () => {
        it('should dispatch setMessageListStatus action', () => {
            const messageListStatus = 'Success' as any; // Using 'as any' to avoid importing the enum

            service.setSelectedChatMessageListStatus(messageListStatus);

            expect(store.dispatch).toHaveBeenCalledWith(
                selectedChatUiActions.setMessageListStatus({
                    messageListStatus,
                }),
            );
        });
    });

    describe('markAllAsRead edge cases', () => {
        it('should return early if chat is null', async () => {
            await service.markAllAsRead(null as any);

            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should return early if chat is undefined', async () => {
            await service.markAllAsRead(undefined as any);

            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should return early if unreadCount is 0', async () => {
            const chat: IChatDto = {
                id: '1',
                unreadCount: 0,
                lastMessageId: '123',
                lastMessageDate: 1234567890,
            };

            await service.markAllAsRead(chat);

            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should call setLastMessageInfo when marking as read', async () => {
            const chat: IChatDto = {
                id: '1',
                unreadCount: 2,
                lastMessageId: '123',
                lastMessageDate: 1234567890,
            };

            apiService.markAsRead.and.resolveTo();
            spyOn(service, 'setLastMessageInfo');

            await service.markAllAsRead(chat);

            expect(service.setLastMessageInfo).toHaveBeenCalledWith(
                chat.id,
                chat.lastMessageDate,
                chat.lastMessageId,
            );
        });
    });

    describe('getImageContent edge cases', () => {
        it('should handle string content type from download response', async () => {
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', [
                'getContent',
                'getWidth',
                'getHeight',
            ]);
            const mockContent = 'string-content';
            mockResponse.getContent.and.returnValue(mockContent);
            mockResponse.getWidth.and.returnValue(150);
            mockResponse.getHeight.and.returnValue(200);

            store.select.and.returnValue(of([]));
            fileStorageService.download.and.resolveTo(mockResponse);
            const imageUrl = 'data:image/png;base64,string-content';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageKey);

            expect(image.imageId).toBe(imageKey.id);
            expect(image.content).toBe(imageUrl);
            expect(image.width).toBe(150);
            expect(image.height).toBe(200);
        });

        it('should throw error for unsupported content type', async () => {
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', [
                'getContent',
                'getWidth',
                'getHeight',
            ]);
            const mockContent = { unsupported: 'type' }; // Unsupported type
            mockResponse.getContent.and.returnValue(mockContent);

            store.select.and.returnValue(of([]));
            fileStorageService.download.and.resolveTo(mockResponse);

            try {
                await service.getImageContent(imageKey);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Unsupported content type');
            }
        });

        it('should return cached image if found in store', async () => {
            const cachedImage: ImageCacheEntry = {
                imageId: imageKey.id,
                content: 'cached-url',
                width: 300,
                height: 400,
            };
            store.select.and.returnValue(of([cachedImage]));

            const result = await service.getImageContent(imageKey);

            expect(result).toBe(cachedImage);
            expect(fileStorageService.download).not.toHaveBeenCalled();
        });

        it('should handle empty image cache array', async () => {
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', [
                'getContent',
                'getWidth',
                'getHeight',
            ]);
            const mockContent = new Uint8Array([1, 2, 3]);
            mockResponse.getContent.and.returnValue(mockContent);
            mockResponse.getWidth.and.returnValue(100);
            mockResponse.getHeight.and.returnValue(100);

            store.select.and.returnValue(of([])); // Empty array
            fileStorageService.download.and.resolveTo(mockResponse);
            const imageUrl = 'data:image/png;base64,generated';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageKey);

            expect(image.imageId).toBe(imageKey.id);
            expect(fileStorageService.download).toHaveBeenCalledWith(imageKey);
        });

        it('should handle null image cache', async () => {
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', [
                'getContent',
                'getWidth',
                'getHeight',
            ]);
            const mockContent = new Uint8Array([1, 2, 3]);
            mockResponse.getContent.and.returnValue(mockContent);
            mockResponse.getWidth.and.returnValue(100);
            mockResponse.getHeight.and.returnValue(100);

            store.select.and.returnValue(of(null)); // Null cache
            fileStorageService.download.and.resolveTo(mockResponse);
            const imageUrl = 'data:image/png;base64,generated';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageKey);

            expect(image.imageId).toBe(imageKey.id);
            expect(fileStorageService.download).toHaveBeenCalledWith(imageKey);
        });
    });
});
