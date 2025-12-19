import { TestBed } from '@angular/core/testing';
import {
    HubConnectionBuilder,
} from '@microsoft/signalr';
import { SignalrService } from './signalr.service';
import { TokenStorageService } from './token-storage.service';
import {
    IImagePreviewDto,
    ILinkPreviewDto,
    IMessageDto,
} from '../api-client/api-client';

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

    beforeEach(() => {
        // Create spies for HubConnection
        mockHubConnection = {
            start: jasmine
                .createSpy('start')
                .and.returnValue(Promise.resolve()),
            stop: jasmine.createSpy('stop').and.returnValue(Promise.resolve()),
            invoke: jasmine
                .createSpy('invoke')
                .and.returnValue(Promise.resolve()),
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
        spyOn(
            HubConnectionBuilder.prototype,
            'withAutomaticReconnect',
        ).and.returnValue(HubConnectionBuilder.prototype);
        spyOn(
            HubConnectionBuilder.prototype,
            'configureLogging',
        ).and.returnValue(HubConnectionBuilder.prototype);
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
        if (jasmine.clock) {
            try {
                jasmine.clock().uninstall();
            } catch (e) {
                // Clock might not be installed
            }
        }
        // Reset the service state
        service.removeHandlers();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('init', () => {
        let messageHandler: jasmine.Spy;
        let linkPreviewHandler: jasmine.Spy;
        let imagePreviewHandler: jasmine.Spy;

        beforeEach(() => {
            messageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            imagePreviewHandler = jasmine.createSpy('imagePreviewHandler');

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
            );

            // Reset spies
            mockHubConnection.start.calls.reset();

            // Second initialization attempt
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            expect(mockHubConnection.start).not.toHaveBeenCalled();
        });

        it('should set up retry timer when connection fails', async () => {
            const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(
                123 as any,
            );

            mockHubConnection.start.and.returnValue(
                Promise.reject(new Error('Connection failed')),
            );

            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            expect(setIntervalSpy).toHaveBeenCalledWith(
                jasmine.any(Function),
                5000,
            );
        });

        it('should handle message notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            // Get the notification handler that was registered
            const notificationHandler =
                mockHubConnection.on.calls.argsFor(0)[1];

            // Simulate receiving a message notification
            await notificationHandler(mockMessageDto, 'MessageDto');

            expect(messageHandler).toHaveBeenCalledWith(mockMessageDto);
        });

        it('should handle link preview notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            const notificationHandler =
                mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockLinkPreviewDto, 'LinkPreviewDto');

            expect(linkPreviewHandler).toHaveBeenCalledWith(mockLinkPreviewDto);
        });

        it('should handle image preview notifications correctly', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            const notificationHandler =
                mockHubConnection.on.calls.argsFor(0)[1];
            notificationHandler(mockImagePreviewDto, 'ImagePreviewDto');

            expect(imagePreviewHandler).toHaveBeenCalledWith(
                mockImagePreviewDto,
            );
        });

        it('should handle unknown notification types gracefully', async () => {
            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            const notificationHandler =
                mockHubConnection.on.calls.argsFor(0)[1];

            // This should not throw an error
            expect(() => {
                notificationHandler(mockMessageDto, 'UnknownType' as any);
            }).not.toThrow();
        });
    });

    describe('removeHandlers', () => {
        it('should remove handlers and stop connection', () => {
            service.removeHandlers();

            expect(mockHubConnection.off).toHaveBeenCalledWith(
                'SendNotificationAsync',
            );
            expect(mockHubConnection.stop).toHaveBeenCalled();
        });

        it('should reset initialization state', async () => {
            const testMessageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const testLinkPreviewHandler =
                jasmine.createSpy('linkPreviewHandler');
            const testImagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

            // Initialize first
            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
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
            );

            expect(mockHubConnection.start).toHaveBeenCalled();
        });
    });

    describe('reconnection handling', () => {
        it('should authorize on reconnection', async () => {
            const testMessageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const testLinkPreviewHandler =
                jasmine.createSpy('linkPreviewHandler');
            const testImagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

            await service.init(
                testMessageHandler,
                testLinkPreviewHandler,
                testImagePreviewHandler,
            );

            // Get the reconnection handler
            const reconnectionHandler =
                mockHubConnection.onreconnected.calls.argsFor(0)[0];

            // Reset invoke spy to track reconnection authorization
            mockHubConnection.invoke.calls.reset();

            // Simulate reconnection
            await reconnectionHandler();

            expect(mockHubConnection.invoke).toHaveBeenCalledWith(
                'AuthorizeAsync',
                mockToken,
            );
        });
    });

    describe('retry mechanism', () => {
        it('should retry connection setup on failure', (done) => {
            const messageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

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
            spyOn(window, 'setInterval').and.callFake(
                (fn: Function, delay: number) => {
                    retryFunction = fn;
                    return 123 as any;
                },
            );

            service
                .init(messageHandler, linkPreviewHandler, imagePreviewHandler)
                .then(() => {
                    // Initial connection should have failed and set up retry
                    expect(window.setInterval).toHaveBeenCalled();
                    expect(mockHubConnection.start).toHaveBeenCalledTimes(1);

                    // Manually trigger retry
                    retryFunction().then(() => {
                        expect(mockHubConnection.start).toHaveBeenCalledTimes(
                            2,
                        );
                        done();
                    });
                });
        });

        it('should clear retry timer when connection succeeds', async () => {
            const clearIntervalSpy = spyOn(window, 'clearInterval');
            const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(
                123 as any,
            );

            const messageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

            // First call fails
            mockHubConnection.start.and.returnValue(
                Promise.reject(new Error('Connection failed')),
            );

            await service.init(
                messageHandler,
                linkPreviewHandler,
                imagePreviewHandler,
            );

            expect(setIntervalSpy).toHaveBeenCalled();

            // Now make connection succeed and test that timer is cleared
            mockHubConnection.start.and.returnValue(Promise.resolve());

            // Get the retry function and call it
            const retryFunction = setIntervalSpy.calls.argsFor(0)[0];
            await retryFunction();

            expect(clearIntervalSpy).toHaveBeenCalledWith(123);
        });
    });

    describe('error handling', () => {
        it('should handle authorization errors gracefully', async () => {
            const messageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

            mockHubConnection.start.and.returnValue(Promise.resolve());
            mockHubConnection.invoke.and.returnValue(
                Promise.reject(new Error('Auth failed')),
            );

            // Should not throw
            await expectAsync(
                service.init(
                    messageHandler,
                    linkPreviewHandler,
                    imagePreviewHandler,
                ),
            ).toBeResolved();
        });

        it('should handle connection start errors gracefully', async () => {
            const messageHandler = jasmine
                .createSpy('messageHandler')
                .and.returnValue(Promise.resolve());
            const linkPreviewHandler = jasmine.createSpy('linkPreviewHandler');
            const imagePreviewHandler = jasmine.createSpy(
                'imagePreviewHandler',
            );

            mockHubConnection.start.and.returnValue(
                Promise.reject(new Error('Start failed')),
            );

            // Should not throw
            await expectAsync(
                service.init(
                    messageHandler,
                    linkPreviewHandler,
                    imagePreviewHandler,
                ),
            ).toBeResolved();
        });
    });
});
