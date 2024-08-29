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
            ['showNotification'],
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
        apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        storeService = TestBed.inject(
            StoreService,
        ) as jasmine.SpyObj<StoreService>;
        signalrService = TestBed.inject(
            SignalrService,
        ) as jasmine.SpyObj<SignalrService>;
        browserNotificationService = TestBed.inject(
            BrowserNotificationService,
        ) as jasmine.SpyObj<BrowserNotificationService>;
    });

    describe('initHandlers', () => {
        it('should initialize SignalR handlers', async () => {
            const handleMessageNotification = jasmine.createSpy(
                'handleMessageNotification',
            );
            const handleLinkPreviewNotification = jasmine.createSpy(
                'handleLinkPreviewNotification',
            );
            const handleImagePreviewNotification = jasmine.createSpy(
                'handleImagePreviewNotification',
            );

            await service.initHandlers(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
            );

            expect(signalrService.init).toHaveBeenCalledWith(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
            );
        });
    });

    describe('removeHandlers', () => {
        it('should remove SignalR handlers', () => {
            service.removeHandlers();

            expect(signalrService.removeHandlers).toHaveBeenCalled();
        });
    });

    describe('handleMessageNotification', () => {
        let messageDto: IMessageDto;
        let selectedChatId: string;
        let chats: IChatDto[];
        let isWindowActive: boolean;

        beforeEach(() => {
            messageDto = {
                id: '1',
                chatId: 'chatId',
                text: 'message',
                created: Date.now(),
                isMine: false,
            } as IMessageDto;
            selectedChatId = 'chatId';
            chats = [
                { id: 'chatId', chatName: 'Chat 1', unreadCount: 0 },
            ] as IChatDto[];
            isWindowActive = false;
        });

        it('should set last message info and add message if chatId matches selectedChatId', async () => {
            await service.handleMessageNotification(
                messageDto,
                selectedChatId,
                chats,
                isWindowActive,
            );

            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                messageDto.chatId,
                messageDto.created,
                messageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledWith(messageDto);
        });

        it('should not mark message as read if it is mine', async () => {
            messageDto.isMine = true;

            await service.handleMessageNotification(
                messageDto,
                selectedChatId,
                chats,
                isWindowActive,
            );

            expect(apiService.markAsRead).not.toHaveBeenCalled();
        });

        it('should mark message as read if window is active and chatId matches selectedChatId', async () => {
            isWindowActive = true;

            await service.handleMessageNotification(
                messageDto,
                selectedChatId,
                chats,
                isWindowActive,
            );

            expect(apiService.markAsRead).toHaveBeenCalledWith(
                messageDto.chatId,
                messageDto.id,
            );
        });

        it('should increment unread messages and show notification if chatId does not match selectedChatId', async () => {
            selectedChatId = 'otherChatId';

            await service.handleMessageNotification(
                messageDto,
                selectedChatId,
                chats,
                isWindowActive,
            );

            expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(
                messageDto.chatId,
            );
            expect(
                browserNotificationService.showNotification,
            ).toHaveBeenCalledWith(
                chats[0].chatName,
                messageDto.imageId ? 'Image' : messageDto.text,
                isWindowActive,
            );
        });

        it('should initialize chat storage if chat is not found', async () => {
            chats = [];

            await service.handleMessageNotification(
                messageDto,
                selectedChatId,
                chats,
                isWindowActive,
            );

            expect(storeService.initChatStorage).toHaveBeenCalledWith(true);
        });
    });

    describe('handleLinkPreviewNotification', () => {
        it('should set link preview if chatId matches selectedChatId', () => {
            const linkPreviewDto: ILinkPreviewDto = {
                chatId: 'chatId',
                url: 'http://example.com',
            } as ILinkPreviewDto;
            const selectedChatId = 'chatId';

            service.handleLinkPreviewNotification(
                linkPreviewDto,
                selectedChatId,
            );

            expect(storeService.setLinkPreview).toHaveBeenCalledWith(
                linkPreviewDto,
            );
        });

        it('should not set link preview if chatId does not match selectedChatId', () => {
            const linkPreviewDto: ILinkPreviewDto = {
                chatId: 'chatId',
                url: 'http://example.com',
            } as ILinkPreviewDto;
            const selectedChatId = 'otherChatId';

            service.handleLinkPreviewNotification(
                linkPreviewDto,
                selectedChatId,
            );

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });
    });

    describe('handleImagePreviewNotification', () => {
        it('should set image preview if chatId matches selectedChatId', () => {
            const imagePreviewDto: IImagePreviewDto = {
                chatId: 'chatId',
                imageId: '1',
            } as IImagePreviewDto;
            const selectedChatId = 'chatId';

            service.handleImagePreviewNotification(
                imagePreviewDto,
                selectedChatId,
            );

            expect(storeService.setImagePreview).toHaveBeenCalledWith(
                imagePreviewDto,
            );
        });

        it('should not set image preview if chatId does not match selectedChatId', () => {
            const imagePreviewDto: IImagePreviewDto = {
                chatId: 'chatId',
                imageId: '1',
            } as IImagePreviewDto;
            const selectedChatId = 'otherChatId';

            service.handleImagePreviewNotification(
                imagePreviewDto,
                selectedChatId,
            );

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });
    });
});
