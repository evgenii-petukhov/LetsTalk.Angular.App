import { TestBed } from '@angular/core/testing';
import { SignalrHandlerService } from './signalr-handler.service';
import { SignalrService } from './signalr.service';
import { StoreService } from './store.service';
import { ApiService } from './api.service';
import { BrowserNotificationService } from './browser-notification.service';
import {
    IMessageDto,
    ILinkPreviewDto,
    IImagePreviewDto,
    IChatDto,
} from '../api-client/api-client';

describe('SignalrHandlerService', () => {
    let service: SignalrHandlerService;
    let apiService: jasmine.SpyObj<ApiService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let signalrService: jasmine.SpyObj<SignalrService>;
    let browserNotificationService: jasmine.SpyObj<BrowserNotificationService>;

    beforeEach(() => {
        apiService = jasmine.createSpyObj('ApiService', ['markAsRead']);
        storeService = jasmine.createSpyObj('StoreService', [
            'setLastMessageInfo',
            'addMessage',
            'incrementUnreadMessages',
            'initChatStorage',
            'setLinkPreview',
            'setImagePreview',
        ]);
        signalrService = jasmine.createSpyObj('SignalrService', [
            'init',
            'removeHandlers',
        ]);
        browserNotificationService = jasmine.createSpyObj(
            'BrowserNotificationService',
            ['init', 'showNotification'],
        );

        TestBed.configureTestingModule({
            providers: [
                SignalrHandlerService,
                { provide: ApiService, useValue: apiService },
                { provide: StoreService, useValue: storeService },
                { provide: SignalrService, useValue: signalrService },
                {
                    provide: BrowserNotificationService,
                    useValue: browserNotificationService,
                },
            ],
        });

        service = TestBed.inject(SignalrHandlerService);
    });

    describe('initHandlers', () => {
        it('should initialize SignalR handlers', async () => {
            // Arrange
            const handleMessageNotification = jasmine.createSpy(
                'handleMessageNotification',
            );
            const handleLinkPreviewNotification = jasmine.createSpy(
                'handleLinkPreviewNotification',
            );
            const handleImagePreviewNotification = jasmine.createSpy(
                'handleImagePreviewNotification',
            );

            // Act
            await service.initHandlers(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
            );

            // Assert
            expect(signalrService.init).toHaveBeenCalledWith(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
            );
            expect(browserNotificationService.init).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeHandlers', () => {
        it('should remove SignalR handlers', () => {
            // Arrange

            // Act
            service.removeHandlers();

            // Assert
            expect(signalrService.removeHandlers).toHaveBeenCalled();
        });
    });

    describe('handleMessageNotification', () => {
        const messageDto = {
            id: '1',
            chatId: 'chatId',
            text: 'message',
            created: 1728867957,
            isMine: false,
        } as IMessageDto;

        const chats = [
            { id: 'chatId', chatName: 'Chat 1', unreadCount: 0 },
        ] as IChatDto[];

        it('should set last message info and add message if chatId matches selectedChatId', async () => {
            // Arrange

            // Act
            await service.handleMessageNotification(
                messageDto,
                'chatId',
                chats,
                false,
            );

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
                messageDto.chatId,
                messageDto.created,
                messageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledOnceWith(
                messageDto,
            );
            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(
                storeService.incrementUnreadMessages,
            ).toHaveBeenCalledOnceWith('chatId');
            expect(
                browserNotificationService.showNotification,
            ).toHaveBeenCalledOnceWith('Chat 1', 'message', false);
            expect(storeService.initChatStorage).not.toHaveBeenCalled();
        });

        it('should not mark message as read if it is mine', async () => {
            // Arrange
            const mockMessageDto = {
                ...messageDto,
                isMine: true,
            };

            // Act
            await service.handleMessageNotification(
                mockMessageDto,
                'chatId',
                chats,
                false,
            );

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
                mockMessageDto.chatId,
                mockMessageDto.created,
                mockMessageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledOnceWith(
                mockMessageDto,
            );
            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(
                browserNotificationService.showNotification,
            ).not.toHaveBeenCalled();
            expect(storeService.initChatStorage).not.toHaveBeenCalled();
        });

        it('should mark message as read if window is active and chatId matches selectedChatId', async () => {
            // Arrange

            // Act
            await service.handleMessageNotification(
                messageDto,
                'chatId',
                chats,
                true,
            );

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
                messageDto.chatId,
                messageDto.created,
                messageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledOnceWith(
                messageDto,
            );
            expect(apiService.markAsRead).toHaveBeenCalledWith(
                messageDto.chatId,
                messageDto.id,
            );
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(
                browserNotificationService.showNotification,
            ).not.toHaveBeenCalled();
            expect(storeService.initChatStorage).not.toHaveBeenCalled();
        });

        it('should increment unread messages and show notification if chatId does not match selectedChatId', async () => {
            // Arrange

            // Act
            await service.handleMessageNotification(
                messageDto,
                'otherChatId',
                chats,
                false,
            );

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
                messageDto.chatId,
                messageDto.created,
                messageDto.id,
            );
            expect(storeService.addMessage).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(
                messageDto.chatId,
            );
            expect(
                browserNotificationService.showNotification,
            ).toHaveBeenCalledWith(
                chats[0].chatName,
                messageDto.image ? 'Image' : messageDto.text,
                false,
            );
            expect(storeService.initChatStorage).not.toHaveBeenCalled();
        });

        it('should initialize chat storage if chat is not found', async () => {
            // Arrange

            // Act
            await service.handleMessageNotification(
                messageDto,
                'chatId',
                [],
                false,
            );

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
                messageDto.chatId,
                messageDto.created,
                messageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledOnceWith(
                messageDto,
            );
            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(
                browserNotificationService.showNotification,
            ).not.toHaveBeenCalled();
            expect(storeService.initChatStorage).toHaveBeenCalledWith(true);
        });
    });

    describe('handleLinkPreviewNotification', () => {
        it('should set link preview if chatId matches selectedChatId', () => {
            // Arrange
            const linkPreviewDto: ILinkPreviewDto = {
                chatId: 'chatId',
                url: 'http://example.com',
            } as ILinkPreviewDto;
            const selectedChatId = 'chatId';

            // Act
            service.handleLinkPreviewNotification(
                linkPreviewDto,
                selectedChatId,
            );

            // Assert
            expect(storeService.setLinkPreview).toHaveBeenCalledWith(
                linkPreviewDto,
            );
        });

        it('should not set link preview if chatId does not match selectedChatId', () => {
            // Arrange
            const linkPreviewDto: ILinkPreviewDto = {
                chatId: 'chatId',
                url: 'http://example.com',
            } as ILinkPreviewDto;
            const selectedChatId = 'otherChatId';

            // Act
            service.handleLinkPreviewNotification(
                linkPreviewDto,
                selectedChatId,
            );

            // Assert
            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });
    });

    describe('handleImagePreviewNotification', () => {
        it('should set image preview if chatId matches selectedChatId', () => {
            // Arrange
            const imagePreviewDto: IImagePreviewDto = {
                chatId: 'chatId',
                imageId: '1',
            } as IImagePreviewDto;
            const selectedChatId = 'chatId';

            // Act
            service.handleImagePreviewNotification(
                imagePreviewDto,
                selectedChatId,
            );

            // Assert
            expect(storeService.setImagePreview).toHaveBeenCalledWith(
                imagePreviewDto,
            );
        });

        it('should not set image preview if chatId does not match selectedChatId', () => {
            // Arrange
            const imagePreviewDto: IImagePreviewDto = {
                chatId: 'chatId',
                imageId: '1',
            } as IImagePreviewDto;
            const selectedChatId = 'otherChatId';

            // Act
            service.handleImagePreviewNotification(
                imagePreviewDto,
                selectedChatId,
            );

            // Assert
            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });
    });
});
