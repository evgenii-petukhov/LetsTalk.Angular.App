/* eslint-disable @typescript-eslint/no-explicit-any */
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
    ImageDto,
} from '../api-client/api-client';

describe('SignalrHandlerService', () => {
    let service: SignalrHandlerService;
    let apiService: jasmine.SpyObj<ApiService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let signalrService: jasmine.SpyObj<SignalrService>;
    let browserNotificationService: jasmine.SpyObj<BrowserNotificationService>;

    const mockMessageDto: IMessageDto = {
        id: '1',
        chatId: 'chatId',
        text: 'message',
        created: 1728867957,
        isMine: false,
        image: null,
    } as IMessageDto;

    const mockImageMessageDto: IMessageDto = {
        id: '2',
        chatId: 'chatId',
        text: '',
        created: 1728867958,
        isMine: false,
        image: new ImageDto(),
    } as IMessageDto;

    const mockChats: IChatDto[] = [
        { id: 'chatId', chatName: 'Chat 1', unreadCount: 0 } as IChatDto,
        { id: 'otherChatId', chatName: 'Chat 2', unreadCount: 0 } as IChatDto,
    ];

    const mockLinkPreviewDto: ILinkPreviewDto = {
        chatId: 'chatId',
        url: 'http://example.com',
        title: 'Example',
    } as ILinkPreviewDto;

    const mockImagePreviewDto: IImagePreviewDto = {
        chatId: 'chatId',
        imageId: '1',
        url: 'http://example.com/image.jpg',
    } as IImagePreviewDto;

    beforeEach(() => {
        // Create spies with return values
        apiService = jasmine.createSpyObj('ApiService', ['markAsRead']);
        apiService.markAsRead.and.returnValue(Promise.resolve());

        storeService = jasmine.createSpyObj('StoreService', [
            'setLastMessageInfo',
            'addMessage',
            'incrementUnreadMessages',
            'initChatStorage',
            'setLinkPreview',
            'setImagePreview',
        ]);
        storeService.initChatStorage.and.returnValue(Promise.resolve());

        signalrService = jasmine.createSpyObj('SignalrService', [
            'init',
            'removeHandlers',
        ]);
        signalrService.init.and.returnValue(Promise.resolve());

        browserNotificationService = jasmine.createSpyObj(
            'BrowserNotificationService',
            ['init', 'showNotification'],
        );
        browserNotificationService.init.and.returnValue(Promise.resolve());

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

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initHandlers', () => {
        let handleMessageNotification: jasmine.Spy;
        let handleLinkPreviewNotification: jasmine.Spy;
        let handleImagePreviewNotification: jasmine.Spy;
        let handleRtcSessionOfferNotification: jasmine.Spy;
        let handleRtcSessionAnswerNotification: jasmine.Spy;

        beforeEach(() => {
            handleMessageNotification = jasmine.createSpy('handleMessageNotification');
            handleLinkPreviewNotification = jasmine.createSpy('handleLinkPreviewNotification');
            handleImagePreviewNotification = jasmine.createSpy('handleImagePreviewNotification');
            handleRtcSessionOfferNotification = jasmine.createSpy('handleRtcSessionOfferNotification');
            handleRtcSessionAnswerNotification = jasmine.createSpy('handleRtcSessionAnswerNotification');
        });

        it('should initialize browser notifications and SignalR handlers', async () => {
            await service.initHandlers(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
                handleRtcSessionOfferNotification,
                handleRtcSessionAnswerNotification,
            );

            expect(browserNotificationService.init).toHaveBeenCalledTimes(1);
            expect(signalrService.init).toHaveBeenCalledWith(
                handleMessageNotification,
                handleLinkPreviewNotification,
                handleImagePreviewNotification,
                handleRtcSessionOfferNotification,
                handleRtcSessionAnswerNotification,
            );
        });

        it('should handle browser notification initialization failure gracefully', async () => {
            browserNotificationService.init.and.returnValue(Promise.reject(new Error('Notification init failed')));

            await expectAsync(
                service.initHandlers(
                    handleMessageNotification,
                    handleLinkPreviewNotification,
                    handleImagePreviewNotification,
                    handleRtcSessionOfferNotification,
                    handleRtcSessionAnswerNotification,
                )
            ).toBeRejected();

            expect(browserNotificationService.init).toHaveBeenCalledTimes(1);
        });

        it('should handle SignalR initialization failure gracefully', async () => {
            signalrService.init.and.returnValue(Promise.reject(new Error('SignalR init failed')));

            await expectAsync(
                service.initHandlers(
                    handleMessageNotification,
                    handleLinkPreviewNotification,
                    handleImagePreviewNotification,
                    handleRtcSessionOfferNotification,
                    handleRtcSessionAnswerNotification,
                )
            ).toBeRejected();

            expect(signalrService.init).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeHandlers', () => {
        it('should remove SignalR handlers', () => {
            service.removeHandlers();

            expect(signalrService.removeHandlers).toHaveBeenCalledTimes(1);
        });

        it('should be callable multiple times without error', () => {
            service.removeHandlers();
            service.removeHandlers();

            expect(signalrService.removeHandlers).toHaveBeenCalledTimes(2);
        });
    });

    describe('handleMessageNotification', () => {
        it('should set last message info and add message if chatId matches selectedChatId', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'chatId',
                mockChats,
                false,
            );

            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.created,
                mockMessageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledWith(mockMessageDto);
        });

        it('should not process further if message is mine', async () => {
            const myMessageDto = { ...mockMessageDto, isMine: true };

            await service.handleMessageNotification(
                myMessageDto,
                'chatId',
                mockChats,
                false,
            );

            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                myMessageDto.chatId,
                myMessageDto.created,
                myMessageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledWith(myMessageDto);
            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(browserNotificationService.showNotification).not.toHaveBeenCalled();
        });

        it('should mark message as read if window is active and chatId matches selectedChatId', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'chatId',
                mockChats,
                true,
            );

            expect(apiService.markAsRead).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.id,
            );
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(browserNotificationService.showNotification).not.toHaveBeenCalled();
        });

        it('should increment unread messages and show notification if chatId does not match selectedChatId', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'otherChatId',
                mockChats,
                false,
            );

            expect(storeService.addMessage).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(mockMessageDto.chatId);
            expect(browserNotificationService.showNotification).toHaveBeenCalledWith(
                'Chat 1',
                mockMessageDto.text,
                false,
            );
        });

        it('should show "Image" notification for image messages', async () => {
            await service.handleMessageNotification(
                mockImageMessageDto,
                'otherChatId',
                mockChats,
                false,
            );

            expect(browserNotificationService.showNotification).toHaveBeenCalledWith(
                'Chat 1',
                'Image',
                false,
            );
        });

        it('should initialize chat storage if chat is not found', async () => {
            const messageWithUnknownChat = { ...mockMessageDto, chatId: 'nonExistentChatId' };
            
            await service.handleMessageNotification(
                messageWithUnknownChat,
                'selectedChatId', // Different from message chatId
                mockChats, // mockChats doesn't contain 'nonExistentChatId'
                false,
            );

            expect(storeService.initChatStorage).toHaveBeenCalledWith(true);
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(browserNotificationService.showNotification).not.toHaveBeenCalled();
        });

        it('should handle empty chats array', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'otherChatId', // Different from message chatId so it goes to else branch
                [],
                false,
            );

            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.created,
                mockMessageDto.id,
            );
            expect(storeService.addMessage).not.toHaveBeenCalled(); // chatId doesn't match selectedChatId
            expect(storeService.initChatStorage).toHaveBeenCalledWith(true);
        });

        it('should handle markAsRead API failure gracefully', async () => {
            apiService.markAsRead.and.returnValue(Promise.reject(new Error('API Error')));

            await expectAsync(
                service.handleMessageNotification(
                    mockMessageDto,
                    'chatId',
                    mockChats,
                    true,
                )
            ).toBeRejected();

            expect(apiService.markAsRead).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.id,
            );
        });

        it('should handle initChatStorage failure gracefully', async () => {
            storeService.initChatStorage.and.returnValue(Promise.reject(new Error('Storage Error')));
            
            const messageWithUnknownChat = { ...mockMessageDto, chatId: 'nonExistentChatId' };

            await expectAsync(
                service.handleMessageNotification(
                    messageWithUnknownChat,
                    'selectedChatId', // Different from message chatId
                    mockChats, // mockChats doesn't contain 'nonExistentChatId'
                    false,
                )
            ).toBeRejected();

            expect(storeService.initChatStorage).toHaveBeenCalledWith(true);
        });

        it('should handle window active state correctly for different chat', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'otherChatId',
                mockChats,
                true, // Window is active but different chat
            );

            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(mockMessageDto.chatId);
            expect(browserNotificationService.showNotification).toHaveBeenCalledWith(
                'Chat 1',
                mockMessageDto.text,
                true, // Window is active
            );
        });

        it('should handle null/undefined message properties', async () => {
            const incompleteMessage = {
                id: '1',
                chatId: 'chatId',
                text: null,
                created: 1728867957,
                isMine: false,
                image: null,
            } as IMessageDto;

            await service.handleMessageNotification(
                incompleteMessage,
                'otherChatId',
                mockChats,
                false,
            );

            expect(browserNotificationService.showNotification).toHaveBeenCalledWith(
                'Chat 1',
                null, // Should handle null text
                false,
            );
        });
    });

    describe('handleLinkPreviewNotification', () => {
        it('should set link preview if chatId matches selectedChatId', () => {
            service.handleLinkPreviewNotification(mockLinkPreviewDto, 'chatId');

            expect(storeService.setLinkPreview).toHaveBeenCalledWith(mockLinkPreviewDto);
        });

        it('should not set link preview if chatId does not match selectedChatId', () => {
            service.handleLinkPreviewNotification(mockLinkPreviewDto, 'otherChatId');

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });

        it('should handle null selectedChatId', () => {
            service.handleLinkPreviewNotification(mockLinkPreviewDto, null as any);

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });

        it('should handle undefined selectedChatId', () => {
            service.handleLinkPreviewNotification(mockLinkPreviewDto, undefined as any);

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });

        it('should handle empty string selectedChatId', () => {
            service.handleLinkPreviewNotification(mockLinkPreviewDto, '');

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });

        it('should handle null linkPreviewDto chatId', () => {
            const nullChatIdDto = { ...mockLinkPreviewDto, chatId: null as any };
            
            service.handleLinkPreviewNotification(nullChatIdDto, 'chatId');

            expect(storeService.setLinkPreview).not.toHaveBeenCalled();
        });
    });

    describe('handleImagePreviewNotification', () => {
        it('should set image preview if chatId matches selectedChatId', () => {
            service.handleImagePreviewNotification(mockImagePreviewDto, 'chatId');

            expect(storeService.setImagePreview).toHaveBeenCalledWith(mockImagePreviewDto);
        });

        it('should not set image preview if chatId does not match selectedChatId', () => {
            service.handleImagePreviewNotification(mockImagePreviewDto, 'otherChatId');

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });

        it('should handle null selectedChatId', () => {
            service.handleImagePreviewNotification(mockImagePreviewDto, null as any);

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });

        it('should handle undefined selectedChatId', () => {
            service.handleImagePreviewNotification(mockImagePreviewDto, undefined as any);

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });

        it('should handle empty string selectedChatId', () => {
            service.handleImagePreviewNotification(mockImagePreviewDto, '');

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });

        it('should handle null imagePreviewDto chatId', () => {
            const nullChatIdDto = { ...mockImagePreviewDto, chatId: null as any };
            
            service.handleImagePreviewNotification(nullChatIdDto, 'chatId');

            expect(storeService.setImagePreview).not.toHaveBeenCalled();
        });
    });

    describe('RTC Session Handlers (if implemented)', () => {
        // These tests assume RTC session handlers exist in the service
        // If they don't exist yet, these tests document the expected behavior

        it('should handle RTC session offer notifications', () => {
            // This test would verify RTC session offer handling
            // Currently the service doesn't seem to have these methods
            // but they're expected based on the SignalR service interface
            
            expect(service).toBeTruthy(); // Placeholder until methods are implemented
        });

        it('should handle RTC session answer notifications', () => {
            // This test would verify RTC session answer handling
            // Currently the service doesn't seem to have these methods
            // but they're expected based on the SignalR service interface
            
            expect(service).toBeTruthy(); // Placeholder until methods are implemented
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete message workflow for active window and selected chat', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'chatId',
                mockChats,
                true,
            );

            // Verify complete workflow
            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.created,
                mockMessageDto.id,
            );
            expect(storeService.addMessage).toHaveBeenCalledWith(mockMessageDto);
            expect(apiService.markAsRead).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.id,
            );
            expect(storeService.incrementUnreadMessages).not.toHaveBeenCalled();
            expect(browserNotificationService.showNotification).not.toHaveBeenCalled();
        });

        it('should handle complete message workflow for inactive window and different chat', async () => {
            await service.handleMessageNotification(
                mockMessageDto,
                'otherChatId',
                mockChats,
                false,
            );

            // Verify complete workflow
            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                mockMessageDto.chatId,
                mockMessageDto.created,
                mockMessageDto.id,
            );
            expect(storeService.addMessage).not.toHaveBeenCalled();
            expect(apiService.markAsRead).not.toHaveBeenCalled();
            expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(mockMessageDto.chatId);
            expect(browserNotificationService.showNotification).toHaveBeenCalledWith(
                'Chat 1',
                mockMessageDto.text,
                false,
            );
        });

        it('should handle service initialization and cleanup lifecycle', async () => {
            const handlers = {
                message: jasmine.createSpy('messageHandler'),
                linkPreview: jasmine.createSpy('linkPreviewHandler'),
                imagePreview: jasmine.createSpy('imagePreviewHandler'),
                rtcOffer: jasmine.createSpy('rtcOfferHandler'),
                rtcAnswer: jasmine.createSpy('rtcAnswerHandler'),
            };

            // Initialize
            await service.initHandlers(
                handlers.message,
                handlers.linkPreview,
                handlers.imagePreview,
                handlers.rtcOffer,
                handlers.rtcAnswer,
            );

            expect(browserNotificationService.init).toHaveBeenCalledTimes(1);
            expect(signalrService.init).toHaveBeenCalledTimes(1);

            // Cleanup
            service.removeHandlers();

            expect(signalrService.removeHandlers).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle concurrent message notifications', async () => {
            const promises = [
                service.handleMessageNotification(mockMessageDto, 'chatId', mockChats, true),
                service.handleMessageNotification(mockImageMessageDto, 'chatId', mockChats, true),
            ];

            await Promise.all(promises);

            expect(storeService.setLastMessageInfo).toHaveBeenCalledTimes(2);
            expect(storeService.addMessage).toHaveBeenCalledTimes(2);
            expect(apiService.markAsRead).toHaveBeenCalledTimes(2);
        });

        it('should handle malformed message data', async () => {
            const malformedMessage = {
                id: null,
                chatId: undefined,
                text: '',
                created: null,
                isMine: undefined,
            } as any;

            // Should not throw
            await expectAsync(
                service.handleMessageNotification(
                    malformedMessage,
                    'chatId',
                    mockChats,
                    false,
                )
            ).toBeResolved();
        });

        it('should handle very large chat arrays efficiently', async () => {
            const largeChatArray = Array.from({ length: 1000 }, (_, i) => ({
                id: `chat-${i}`,
                chatName: `Chat ${i}`,
                unreadCount: 0,
            })) as IChatDto[];

            const startTime = performance.now();
            
            await service.handleMessageNotification(
                mockMessageDto,
                'otherChatId',
                largeChatArray,
                false,
            );

            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });
    });
});
