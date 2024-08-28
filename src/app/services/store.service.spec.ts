import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { StoreService } from './store.service';
import { ApiService } from './api.service';
import { FileStorageService } from './file-storage.service';
import { chatsActions } from '../state/chats/chats.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { imagesActions } from '../state/images/images.actions';
import { IChatDto, IProfileDto, ChatDto } from '../api-client/api-client';
import { Image } from '../models/image';

describe('StoreService', () => {
    let service: StoreService;
    let store: jasmine.SpyObj<Store>;
    let apiService: jasmine.SpyObj<ApiService>;
    let fileStorageService: jasmine.SpyObj<FileStorageService>;

    beforeEach(() => {
        const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
        const apiServiceSpy = jasmine.createSpyObj('ApiService', ['markAsRead', 'getChats', 'getAccounts', 'getProfile']);
        const fileStorageServiceSpy = jasmine.createSpyObj('FileStorageService', ['download']);

        TestBed.configureTestingModule({
            providers: [
                StoreService,
                { provide: Store, useValue: storeSpy },
                { provide: ApiService, useValue: apiServiceSpy },
                { provide: FileStorageService, useValue: fileStorageServiceSpy },
            ],
        });

        service = TestBed.inject(StoreService);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        fileStorageService = TestBed.inject(FileStorageService) as jasmine.SpyObj<FileStorageService>;
    });

    describe('markAllAsRead', () => {
        it('should mark all messages as read and update the unread count', async () => {
            const chat: IChatDto = { id: '1', unreadCount: 2, lastMessageId: '123', lastMessageDate: 1234567890 };

            apiService.markAsRead.and.returnValue(Promise.resolve());

            await service.markAllAsRead(chat);

            expect(apiService.markAsRead).toHaveBeenCalledWith(chat.id, chat.lastMessageId);
            expect(store.dispatch).toHaveBeenCalledWith(chatsActions.setUnreadCount({
                chatId: chat.id,
                unreadCount: 0,
            }));
        });
    });

    describe('initChatStorage', () => {
        it('should initialize chat storage when forced', async () => {
            const mockChats: ChatDto[] = [{ id: '1' } as ChatDto];
            apiService.getChats.and.returnValue(Promise.resolve(mockChats));

            await service.initChatStorage(true);

            expect(apiService.getChats).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(chatsActions.init({ chats: mockChats }));
        });

        it('should not call API if chats are already in the store', async () => {
            store.select.and.returnValue(of([{ id: '1' }] as ChatDto[]));

            await service.initChatStorage();

            expect(apiService.getChats).not.toHaveBeenCalled();
        });
    });

    describe('getLoggedInUser', () => {
        it('should return logged in user from store if exists', async () => {
            const mockUser: IProfileDto = { id: '1' } as IProfileDto;
            store.select.and.returnValue(of(mockUser));

            const user = await service.getLoggedInUser();

            expect(user).toBe(mockUser);
            expect(apiService.getProfile).not.toHaveBeenCalled();
        });

        it('should fetch logged in user from API if not in store', async () => {
            const mockUser: IProfileDto = { id: '1' } as IProfileDto;
            store.select.and.returnValue(of(null));
            apiService.getProfile.and.returnValue(Promise.resolve(mockUser));

            const user = await service.getLoggedInUser();

            expect(user).toBe(mockUser);
            expect(apiService.getProfile).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(loggedInUserActions.init({ account: mockUser }));
        });
    });

    describe('getImageContent', () => {
        it('should return image from store if exists', async () => {
            const imageId = '1';
            const mockImage: Image = { imageId, content: 'url', width: 100, height: 100 };
            store.select.and.returnValue(of([mockImage]));

            const image = await service.getImageContent(imageId);

            expect(image).toBe(mockImage);
            expect(fileStorageService.download).not.toHaveBeenCalled();
        });

        it('should download image if not in store', async () => {
            const imageId = '1';
            const mockResponse = jasmine.createSpyObj('DownloadImageResponse', ['getContent', 'getWidth', 'getHeight']);
            const mockContent = new Uint8Array([97, 98, 99]); // 'abc' in Uint8Array
            mockResponse.getContent.and.returnValue(mockContent);
            mockResponse.getWidth.and.returnValue(100);
            mockResponse.getHeight.and.returnValue(100);

            store.select.and.returnValue(of([]));
            fileStorageService.download.and.returnValue(Promise.resolve(mockResponse));
            const imageUrl = 'data:image/png;base64,...';
            spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);

            const image = await service.getImageContent(imageId);

            expect(fileStorageService.download).toHaveBeenCalledWith(imageId);

            expect(store.dispatch).toHaveBeenCalledWith(imagesActions.add({
                image: {
                    imageId,
                    content: imageUrl,
                    width: 100,
                    height: 100,
                }
            }));
            expect(image.imageId).toBe(imageId);
            expect(image.content).toBe(imageUrl);
        });
    });
});
