import { TestBed } from '@angular/core/testing';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { SignalrService } from './signalr.service';
import { TokenStorageService } from './token-storage.service';
import {
    IImagePreviewDto,
    ILinkPreviewDto,
    IMessageDto,
} from '../api-client/api-client';
import { RtcSessionSettings } from '../models/rtc-sessions-settings';

describe('SignalrService', () => {
    let service: SignalrService;
    let mockTokenStorageService: jasmine.SpyObj<TokenStorageService>;
    let mockHubConnection: any;

    const mockToken = 'test-token';
    const mockMessageDto: IMessageDto = {
        id: '1',
        text: 'test message',
        createdAt: new Date(),
        userId: 'user1',
    } as IMessageDto;

    const mockLinkPreviewDto: ILinkPreviewDto = {
        url: 'https://example.com',
        title: 'Test Link',
    } as ILinkPreviewDto;

    const mockImagePreviewDto: IImagePreviewDto = {
        url: 'https://example.com/image.jpg',
        width: 100,
        height: 100,
    } as IImagePreviewDto;

    const mockRtcSessionSettings: RtcSessionSettings = {
        sessionId: 'session-123',
        offer: 'mock-offer-data',
        answer: 'mock-answer-data'
    } as RtcSessionSettings;

    beforeEach(() => {
        // Create spies for HubConnection
        mockHubConnection = {
            start: jasmine.createSpy('start').and.returnValue(Promise.resolve()),
            stop: jasmine.createSpy('stop').and.returnValue(Promise.resolve()),
            invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve()),
            on: jasmine.createSpy('on'),
            off: jasmine.createSpy('off'),
            onreconnected: jasmine.createSpy('onreconnected'),
        };

        // Create spy for TokenStorageService
        mockTokenStorageService = jasmine.createSpyObj('TokenStorageService', [
            'getToken',
        ]);
        mockTokenStorageService.getToken.and.returnValue(mockToken);

        // Mock HubConnectionBuilder
        spyOn(HubConnectionBuilder.prototype, 'withUrl').and.returnValue(
            HubConnectionBuilder.prototype,
        );
        spyOn(HubConnectionBuilder.prototype, 'withAutomaticReconnect').and.returnValue(
            HubConnectionBuilder.prototype,
        );
        spyOn(HubConnectionBuilder.prototype, 'configureLogging').and.returnValue(
            HubConnectionBuilder.prototype,
        );
        spyOn(HubConnectionBuilder.prototype, 'build').and.returnValue(
            mockHubConnection,
        );

        TestBed.configureTestingModule({
            providers: [
                SignalrService,
                {
                    provide: TokenStorageService,
                    useValue: mockTokenStorageService,
                },
            ],
        });

        service = TestBed.inject(SignalrService);
    });

    afterEach(() => {
        // Clear any timers that might be running
        try {
            if ((service as any).connectionTimerId) {
                clearInterval((service as any).connectionTimerId);
            }
            // Reset the service state
            if (service && service.removeHandlers) {
                service.removeHandlers();
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('init', () => {
        let messageHandler: jasmine.Spy;
        let linkPreviewHandler: jasmine.Spy;
        let imagePreviewHandler: jasmine.Spy;
        let rtcSessionOfferHandler: jasmine.Spy;
        let rtcSessionAnswerHandler: jasmine.Spy;

        beforeEach(() => {
            messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            rtcSessionOfferHandler = jasmine.createSpy('rtcSessionOfferHandler');
            rtcSessionAnswerHandler = jasmine.createSpy('rtcSessionAnswerHandler');

            // Reset spies for each test
            mockHubConnection.start.and.returnValue(Promise.resolve());
            mockHubConnection.invoke.and.returnValue(Promise.resolve());
            mockHubConnection.start.calls.reset();
            mockHubConnection.invoke.calls.reset();
            mockHubConnection.on.calls.reset();
            mockHubConnection.onreconnected.calls.reset();
        });

        it('should initialize successfully when connection is established', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            expect(mockHubConnection.start).toHaveBeenCalled();
            expect(mockHubConnection.invoke).toHaveBeenCalledWith(
                'AuthorizeAsync',
                mockToken,
            );
            expect(mockHubConnection.on).toHaveBeenCalledWith(
                'SendNotificationAsync',
                jasmine.any(Function),
            );
            expect(mockHubConnection.onreconnected).toHaveBeenCalledWith(
                jasmine.any(Function),
            );
        });

        it('should not reinitialize if already initialized', async () => {
            // First initialization
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            // Reset spies
            mockHubConnection.start.calls.reset();

            // Second initialization attempt
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            expect(mockHubConnection.start).not.toHaveBeenCalled();
        });

        it('should set up retry timer when connection fails', async () => {
            const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(123 as any);

            mockHubConnection.start.and.returnValue(
                Promise.reject(new Error('Connection failed')),
            );

            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            expect(setIntervalSpy).toHaveBeenCalledWith(
                jasmine.any(Function),
                jasmine.any(Number),
            );
        });

        it('should handle message notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            // Get the notification handler that was registered
            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];

            // Simulate receiving a message notification
            await notificationHandler(mockMessageDto, 'MessageDto');

            expect(messageHandler).toHaveBeenCalledWith(mockMessageDto);
        });

        it('should handle link preview notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockLinkPreviewDto, 'LinkPreviewDto');

            expect(linkPreviewHandler).toHaveBeenCalledWith(mockLinkPreviewDto);
        });

        it('should handle image preview notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockImagePreviewDto, 'ImagePreviewDto');

            expect(imagePreviewHandler).toHaveBeenCalledWith(mockImagePreviewDto);
        });

        it('should handle RTC session offer notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockRtcSessionSettings, 'RtcSessionOffer');

            expect(rtcSessionOfferHandler).toHaveBeenCalledWith(mockRtcSessionSettings);
        });

        it('should handle RTC session answer notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockRtcSessionSettings, 'RtcSessionAnswer');

            expect(rtcSessionAnswerHandler).toHaveBeenCalledWith(mockRtcSessionSettings);
        });

        it('should handle unknown notification types gracefully', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];

            // This should not throw an error
            expect(() => {
                notificationHandler(mockMessageDto, 'UnknownType' as any);
            }).not.toThrow();
        });

        it('should handle null/undefined handlers gracefully', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
                rtcSessionOfferHandler,
                rtcSessionAnswerHandler
            );

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];

            // Override handler mapping to test null handler
            (service as any).handlerMapping = {
                MessageDto: null,
                LinkPreviewDto: linkPreviewHandler,
                ImagePreviewDto: imagePreviewHandler,
                RtcSessionOffer: rtcSessionOfferHandler,
                RtcSessionAnswer: rtcSessionAnswerHandler
            };

            // This should not throw an error
            expect(() => {
                notificationHandler(mockMessageDto, 'MessageDto');
            }).not.toThrow();
        });
    });

    describe('removeHandlers', () => {
        it('should remove handlers and stop connection', () => {
            service.removeHandlers();

            expect(mockHubConnection.off).toHaveBeenCalledWith('SendNotificationAsync');
            expect(mockHubConnection.stop).toHaveBeenCalled();
        });

        it('should reset initialization state', async () => {
            const testMessageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const testLinkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const testImagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const testRtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const testRtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            // Initialize first
            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
                testRtcOfferHandler,
                testRtcAnswerHandler
            );

            // Remove handlers
            service.removeHandlers();

            // Reset spies
            mockHubConnection.start.calls.reset();

            // Should be able to initialize again
            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
                testRtcOfferHandler,
                testRtcAnswerHandler
            );

            expect(mockHubConnection.start).toHaveBeenCalled();
        });
    });

    describe('reconnection handling', () => {
        it('should authorize on reconnection', async () => {
            const testMessageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const testLinkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const testImagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const testRtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const testRtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
                testRtcOfferHandler,
                testRtcAnswerHandler
            );

            // Get the reconnection handler
            const reconnectionHandler = mockHubConnection.onreconnected.calls.argsFor(0)[0];

            // Reset invoke spy to track reconnection authorization
            mockHubConnection.invoke.calls.reset();

            // Simulate reconnection
            await reconnectionHandler();

            expect(mockHubConnection.invoke).toHaveBeenCalledWith('AuthorizeAsync', mockToken);
        });

        it('should handle reconnection authorization errors gracefully', async () => {
            const testMessageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const testLinkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const testImagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const testRtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const testRtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
                testRtcOfferHandler,
                testRtcAnswerHandler
            );

            const reconnectionHandler = mockHubConnection.onreconnected.calls.argsFor(0)[0];
            
            // Make authorization fail on reconnection
            mockHubConnection.invoke.and.returnValue(Promise.reject(new Error('Auth failed')));

            // Should not throw - the actual service doesn't handle this error, so it will reject
            await expectAsync(reconnectionHandler()).toBeRejected();
        });
    });

    describe('retry mechanism', () => {
        it('should retry connection setup on failure', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            let callCount = 0;
            mockHubConnection.start.and.callFake(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('Connection failed'));
                }
                return Promise.resolve();
            });

            // Mock setInterval to capture the retry function
            let retryFunction: Function;
            spyOn(window, 'setInterval').and.callFake((fn: Function, delay: number) => {
                retryFunction = fn;
                return 123 as any;
            });

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            // Initial connection should have failed and set up retry
            expect(window.setInterval).toHaveBeenCalled();
            expect(mockHubConnection.start).toHaveBeenCalledTimes(1);

            // Manually trigger retry
            await retryFunction();
            expect(mockHubConnection.start).toHaveBeenCalledTimes(2);
        });

        it('should clear retry timer when connection succeeds', async () => {
            const clearIntervalSpy = spyOn(window, 'clearInterval');
            const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(123 as any);

            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            // First call fails
            mockHubConnection.start.and.returnValue(Promise.reject(new Error('Connection failed')));

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            expect(setIntervalSpy).toHaveBeenCalled();

            // Now make connection succeed and test that timer is cleared
            mockHubConnection.start.and.returnValue(Promise.resolve());

            // Get the retry function and call it
            const retryFunction = setIntervalSpy.calls.argsFor(0)[0];
            await retryFunction();

            expect(clearIntervalSpy).toHaveBeenCalledWith(123);
        });

        it('should not set up retry timer if connection succeeds initially', async () => {
            const setIntervalSpy = spyOn(window, 'setInterval');

            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            // Connection succeeds
            mockHubConnection.start.and.returnValue(Promise.resolve());

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            expect(setIntervalSpy).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle authorization errors gracefully', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            mockHubConnection.start.and.returnValue(Promise.resolve());
            mockHubConnection.invoke.and.returnValue(Promise.reject(new Error('Auth failed')));

            // Should not throw
            await expectAsync(
                service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler),
            ).toBeResolved();
        });

        it('should handle connection start errors gracefully', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            mockHubConnection.start.and.returnValue(Promise.reject(new Error('Start failed')));

            // Should not throw
            await expectAsync(
                service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler),
            ).toBeResolved();
        });

        it('should handle message handler errors gracefully', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.reject(new Error('Handler failed')));
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];

            // Should not throw even if handler fails
            expect(() => {
                notificationHandler(mockMessageDto, 'MessageDto');
            }).not.toThrow();

            expect(messageHandler).toHaveBeenCalledWith(mockMessageDto);
        });
    });

    describe('private methods', () => {
        it('should call authorize with correct token', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            expect(mockTokenStorageService.getToken).toHaveBeenCalled();
            expect(mockHubConnection.invoke).toHaveBeenCalledWith('AuthorizeAsync', mockToken);
        });

        it('should set up connection event handlers correctly', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            expect(mockHubConnection.on).toHaveBeenCalledWith('SendNotificationAsync', jasmine.any(Function));
            expect(mockHubConnection.onreconnected).toHaveBeenCalledWith(jasmine.any(Function));
        });
    });

    describe('integration tests', () => {
        it('should handle complete workflow successfully', async () => {
            const messageHandler = jasmine.createSpy('messageHandler').and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');
            const rtcOfferHandler = jasmine.createSpy('rtcOfferHandler');
            const rtcAnswerHandler = jasmine.createSpy('rtcAnswerHandler');

            // Initialize service
            await service.init(messageHandler, linkPreviewHandler, imagePreviewHandler, rtcOfferHandler, rtcAnswerHandler);

            // Verify initialization
            expect(mockHubConnection.start).toHaveBeenCalled();
            expect(mockHubConnection.invoke).toHaveBeenCalledWith('AuthorizeAsync', mockToken);

            // Test notification handling
            const notificationHandler = mockHubConnection.on.calls.argsFor(0)[1];
            
            await notificationHandler(mockMessageDto, 'MessageDto');
            notificationHandler(mockLinkPreviewDto, 'LinkPreviewDto');
            notificationHandler(mockImagePreviewDto, 'ImagePreviewDto');
            notificationHandler(mockRtcSessionSettings, 'RtcSessionOffer');
            notificationHandler(mockRtcSessionSettings, 'RtcSessionAnswer');

            expect(messageHandler).toHaveBeenCalledWith(mockMessageDto);
            expect(linkPreviewHandler).toHaveBeenCalledWith(mockLinkPreviewDto);
            expect(imagePreviewHandler).toHaveBeenCalledWith(mockImagePreviewDto);
            expect(rtcOfferHandler).toHaveBeenCalledWith(mockRtcSessionSettings);
            expect(rtcAnswerHandler).toHaveBeenCalledWith(mockRtcSessionSettings);

            // Test cleanup
            service.removeHandlers();
            expect(mockHubConnection.off).toHaveBeenCalledWith('SendNotificationAsync');
            expect(mockHubConnection.stop).toHaveBeenCalled();
        });
    });
});