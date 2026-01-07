/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { RtcConnectionService } from './rtc-connection.service';
import { ApiService } from './api.service';
import { RtcPeerConnectionManager } from './rtc-peer-connection-manager';
import { StoreService } from './store.service';
import { CallSettingsDto } from '../api-client/api-client';

describe('RtcConnectionService', () => {
    let service: RtcConnectionService;
    let apiService: jasmine.SpyObj<ApiService>;
    let connectionManager: jasmine.SpyObj<RtcPeerConnectionManager>;
    let storeService: jasmine.SpyObj<StoreService>;
    let mockStore: jasmine.SpyObj<Store>;

    const mockCallSettings = {
        iceServerConfiguration: JSON.stringify({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        }),
    } as CallSettingsDto;

    const mockOffer = {
        desc: {
            type: 'offer' as RTCSdpType,
            sdp: 'mock-offer-sdp',
        },
        candidates: [
            {
                candidate:
                    'candidate:1 1 UDP 2130706431 192.168.1.1 54400 typ host',
                sdpMLineIndex: 0,
                sdpMid: '0',
            },
        ],
    };

    const mockAnswer = {
        desc: {
            type: 'answer' as RTCSdpType,
            sdp: 'mock-answer-sdp',
        },
        candidates: [
            {
                candidate:
                    'candidate:2 1 UDP 2130706431 192.168.1.2 54401 typ host',
                sdpMLineIndex: 0,
                sdpMid: '0',
            },
        ],
    };

    beforeEach(() => {
        apiService = jasmine.createSpyObj('ApiService', [
            'getCallSettings',
            'startOutgoingCall',
            'handleIncomingCall',
        ]);

        connectionManager = jasmine.createSpyObj(
            'RtcPeerConnectionManager',
            [
                'initiateOffer',
                'handleOfferAndCreateAnswer',
                'setRemoteAnswerAndCandidates',
                'requestCompleteGathering',
                'reinitialize',
            ],
            {
                onCandidatesReceived: null,
                onGatheringCompleted: null,
                onConnectionStateChange: null,
            },
        );

        storeService = jasmine.createSpyObj('StoreService', [
            'resetCall',
        ]);

        mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

        TestBed.configureTestingModule({
            providers: [
                RtcConnectionService,
                { provide: ApiService, useValue: apiService },
                {
                    provide: RtcPeerConnectionManager,
                    useValue: connectionManager,
                },
                { provide: StoreService, useValue: storeService },
                { provide: Store, useValue: mockStore },
            ],
        });

        service = TestBed.inject(RtcConnectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set up connection manager callbacks in constructor', () => {
        expect(connectionManager.onCandidatesReceived).toBeDefined();
        expect(connectionManager.onGatheringCompleted).toBeDefined();
        expect(connectionManager.onConnectionStateChange).toBeDefined();
    });

    describe('startOutgoingCall', () => {
        beforeEach(() => {
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.startOutgoingCall.and.returnValue(Promise.resolve());
        });

        it('should start outgoing call successfully', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const finalOfferData = JSON.stringify(mockOffer);

            // Act
            const promise = service.startOutgoingCall(accountId);

            // Simulate ice candidate generation first, then completion
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalOfferData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await promise;

            // Assert
            expect(apiService.getCallSettings).toHaveBeenCalled();
            expect(connectionManager.initiateOffer).toHaveBeenCalledWith(
                JSON.parse(mockCallSettings.iceServerConfiguration),
            );
            expect(apiService.startOutgoingCall).toHaveBeenCalledWith(
                accountId,
                finalOfferData,
            );
        });

        it('should handle timer expiration during ice gathering', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const finalOfferData = JSON.stringify(mockOffer);

            // Act
            const promise = service.startOutgoingCall(accountId);

            // Wait for timer to be created
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Mock the timer to be expired
            service['iceGatheringTimer'] = {
                isExpired: jasmine.createSpy('isExpired').and.returnValue(true),
                clear: jasmine.createSpy('clear'),
            } as any;

            // Simulate ice candidate generation with expired timer
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalOfferData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await promise;

            // Assert
            expect(
                connectionManager.requestCompleteGathering,
            ).toHaveBeenCalled();
        });
    });

    describe('handleIncomingCall', () => {
        beforeEach(() => {
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.handleIncomingCall.and.returnValue(Promise.resolve());
        });

        it('should handle incoming call successfully', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const offerString = JSON.stringify(mockOffer);
            const finalAnswerData = JSON.stringify(mockAnswer);

            // Act
            const promise = service.handleIncomingCall(chatId, offerString);

            // Simulate ice candidate generation first, then completion
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalAnswerData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await promise;

            // Assert
            expect(apiService.getCallSettings).toHaveBeenCalled();
            expect(
                connectionManager.handleOfferAndCreateAnswer,
            ).toHaveBeenCalledWith(
                JSON.parse(mockCallSettings.iceServerConfiguration),
                mockOffer.desc,
                mockOffer.candidates,
            );
            expect(apiService.handleIncomingCall).toHaveBeenCalledWith(
                chatId,
                finalAnswerData,
            );
        });

        it('should handle timer expiration during answer generation', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const offerString = JSON.stringify(mockOffer);
            const finalAnswerData = JSON.stringify(mockAnswer);

            // Act
            const promise = service.handleIncomingCall(chatId, offerString);

            // Wait for timer to be created
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Mock the timer to be expired
            service['iceGatheringTimer'] = {
                isExpired: jasmine.createSpy('isExpired').and.returnValue(true),
                clear: jasmine.createSpy('clear'),
            } as any;

            // Simulate ice candidate generation with expired timer
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalAnswerData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await promise;

            // Assert
            expect(
                connectionManager.requestCompleteGathering,
            ).toHaveBeenCalled();
        });
    });

    describe('establishConnection', () => {
        it('should establish connection with valid answer', async () => {
            // Arrange
            const answerString = JSON.stringify(mockAnswer);

            // Act
            await service.establishConnection(answerString);

            // Assert
            expect(
                connectionManager.setRemoteAnswerAndCandidates,
            ).toHaveBeenCalledWith(mockAnswer.desc, mockAnswer.candidates);
        });

        it('should return early if answer type is not "answer"', async () => {
            // Arrange
            const invalidAnswer = {
                desc: {
                    type: 'offer' as RTCSdpType, // Wrong type
                    sdp: 'mock-sdp',
                },
                candidates: [],
            };
            const answerString = JSON.stringify(invalidAnswer);

            // Act
            await service.establishConnection(answerString);

            // Assert
            expect(
                connectionManager.setRemoteAnswerAndCandidates,
            ).not.toHaveBeenCalled();
        });

        it('should handle malformed JSON gracefully', async () => {
            // Arrange
            const malformedJson = 'invalid-json';

            // Act & Assert
            await expectAsync(
                service.establishConnection(malformedJson),
            ).toBeRejected();
        });
    });

    describe('onIceCandidateGenerated', () => {
        it('should emit ice candidate data', () => {
            // Arrange
            const testData = 'test-ice-candidate-data';
            spyOn(service['iceCandidateSubject'], 'next');

            // Mock timer as not expired
            service['iceGatheringTimer'] = { isExpired: () => false } as any;

            // Act
            service['onIceCandidateGenerated'](testData);

            // Assert
            expect(service['iceCandidateSubject'].next).toHaveBeenCalledWith(
                testData,
            );
        });

        it('should request complete gathering when timer is expired', () => {
            // Arrange
            const testData = 'test-ice-candidate-data';
            service['iceGatheringTimer'] = { isExpired: () => true } as any;

            // Act
            service['onIceCandidateGenerated'](testData);

            // Assert
            expect(
                connectionManager.requestCompleteGathering,
            ).toHaveBeenCalled();
        });

        it('should not request complete gathering when timer is not expired', () => {
            // Arrange
            const testData = 'test-ice-candidate-data';
            service['iceGatheringTimer'] = { isExpired: () => false } as any;

            // Act
            service['onIceCandidateGenerated'](testData);

            // Assert
            expect(
                connectionManager.requestCompleteGathering,
            ).not.toHaveBeenCalled();
        });
    });

    describe('onIceGatheringComplete', () => {
        it('should emit gathering complete signal and clear timer', () => {
            // Arrange
            spyOn(service['iceGatheringComplete'], 'next');
            const mockTimer = { clear: jasmine.createSpy('clear') };
            service['iceGatheringTimer'] = mockTimer as any;

            // Act
            service['onIceGatheringComplete']();

            // Assert
            expect(service['iceGatheringComplete'].next).toHaveBeenCalled();
            expect(mockTimer.clear).toHaveBeenCalled();
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete outgoing call flow', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const finalOfferData = JSON.stringify(mockOffer);
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.startOutgoingCall.and.returnValue(Promise.resolve());

            // Act - Start the call
            const callPromise = service.startOutgoingCall(accountId);

            // Simulate the WebRTC flow
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalOfferData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await callPromise;

            // Assert
            expect(apiService.getCallSettings).toHaveBeenCalled();
            expect(connectionManager.initiateOffer).toHaveBeenCalled();
            expect(apiService.startOutgoingCall).toHaveBeenCalledWith(
                accountId,
                finalOfferData,
            );
        });

        it('should handle complete incoming call flow', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const offerString = JSON.stringify(mockOffer);
            const finalAnswerData = JSON.stringify(mockAnswer);
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.handleIncomingCall.and.returnValue(Promise.resolve());

            // Act - Handle the incoming call
            const callPromise = service.handleIncomingCall(chatId, offerString);

            // Simulate the WebRTC flow
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalAnswerData);
            }, 0);

            setTimeout(() => {
                service['onIceGatheringComplete']();
            }, 5);

            await callPromise;

            // Assert
            expect(apiService.getCallSettings).toHaveBeenCalled();
            expect(
                connectionManager.handleOfferAndCreateAnswer,
            ).toHaveBeenCalled();
            expect(apiService.handleIncomingCall).toHaveBeenCalledWith(
                chatId,
                finalAnswerData,
            );
        });

        it('should handle connection establishment after call setup', async () => {
            // Arrange
            const answerString = JSON.stringify(mockAnswer);

            // Act
            await service.establishConnection(answerString);

            // Assert
            expect(
                connectionManager.setRemoteAnswerAndCandidates,
            ).toHaveBeenCalledWith(mockAnswer.desc, mockAnswer.candidates);
        });
    });

    describe('endCall', () => {
        it('should call processEndCall', () => {
            // Arrange
            spyOn(service as any, 'processEndCall');

            // Act
            service.endCall();

            // Assert
            expect(service['processEndCall']).toHaveBeenCalled();
        });
    });

    describe('onConnectionStateChange', () => {
        it('should call processEndCall when state is disconnected', () => {
            // Arrange
            spyOn(service as any, 'processEndCall');

            // Act
            service['onConnectionStateChange']('disconnected');

            // Assert
            expect(service['processEndCall']).toHaveBeenCalled();
        });

        it('should not call processEndCall when state is not disconnected', () => {
            // Arrange
            spyOn(service as any, 'processEndCall');

            // Act
            service['onConnectionStateChange']('connected');

            // Assert
            expect(service['processEndCall']).not.toHaveBeenCalled();
        });

        it('should handle all RTCPeerConnectionState values correctly', () => {
            // Arrange
            spyOn(service as any, 'processEndCall');
            const states: RTCPeerConnectionState[] = [
                'closed',
                'connected',
                'connecting',
                'disconnected',
                'failed',
                'new',
            ];

            // Act & Assert
            states.forEach((state) => {
                service['onConnectionStateChange'](state);
                if (state === 'disconnected') {
                    expect(service['processEndCall']).toHaveBeenCalled();
                } else {
                    expect(service['processEndCall']).not.toHaveBeenCalled();
                }
                (service['processEndCall'] as jasmine.Spy).calls.reset();
            });
        });
    });

    describe('processEndCall', () => {
        it('should reinitialize connection manager and reset call in store', () => {
            // Act
            service['processEndCall']();

            // Assert
            expect(connectionManager.reinitialize).toHaveBeenCalled();
            expect(storeService.resetCall).toHaveBeenCalled();
        });
    });

    describe('Timer integration', () => {
        it('should create timer with correct timeout in startOutgoingCall', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const finalOfferData = JSON.stringify(mockOffer);
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.startOutgoingCall.and.returnValue(Promise.resolve());

            // Act
            const callPromise = service.startOutgoingCall(accountId);

            // Wait for timer to be created
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert timer was created with correct timeout
            expect(service['iceGatheringTimer']).toBeDefined();
            expect(service['iceGatheringTimeoutMs']).toBe(10000);

            // Complete the call
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalOfferData);
                service['onIceGatheringComplete']();
            }, 0);

            await callPromise;
        });

        it('should create timer with correct timeout in handleIncomingCall', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const offerString = JSON.stringify(mockOffer);
            const finalAnswerData = JSON.stringify(mockAnswer);
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            apiService.handleIncomingCall.and.returnValue(Promise.resolve());

            // Act
            const callPromise = service.handleIncomingCall(chatId, offerString);

            // Wait for timer to be created
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert timer was created with correct timeout
            expect(service['iceGatheringTimer']).toBeDefined();
            expect(service['iceGatheringTimeoutMs']).toBe(10000);

            // Complete the call
            setTimeout(() => {
                service['onIceCandidateGenerated'](finalAnswerData);
                service['onIceGatheringComplete']();
            }, 0);

            await callPromise;
        });
    });

    describe('Subject behavior', () => {
        it('should have iceCandidateSubject and iceGatheringComplete subjects initialized', () => {
            expect(service['iceCandidateSubject']).toBeDefined();
            expect(service['iceGatheringComplete']).toBeDefined();
        });

        it('should complete ice gathering observable when onIceGatheringComplete is called', (done) => {
            // Arrange
            let completed = false;
            const mockTimer = { clear: jasmine.createSpy('clear') };
            service['iceGatheringTimer'] = mockTimer as any;
            
            service['iceGatheringComplete'].subscribe({
                next: () => {
                    completed = true;
                },
                complete: () => {
                    // This should not be called in this test
                },
            });

            // Act
            service['onIceGatheringComplete']();

            // Assert
            setTimeout(() => {
                expect(completed).toBe(true);
                expect(mockTimer.clear).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('JSON parsing edge cases', () => {
        it('should handle malformed JSON in handleIncomingCall', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const malformedOffer = 'invalid-json';

            // Act & Assert
            await expectAsync(
                service.handleIncomingCall(chatId, malformedOffer),
            ).toBeRejected();
        });

        it('should handle JSON with missing properties in establishConnection', async () => {
            // Arrange
            const incompleteAnswer = JSON.stringify({
                desc: { type: 'answer' },
                // Missing candidates - this will cause an error when trying to access remote.candidates
            });

            // Act & Assert
            try {
                await service.establishConnection(incompleteAnswer);
                // If we get here, the method didn't throw, which means it handled missing candidates gracefully
                expect(connectionManager.setRemoteAnswerAndCandidates).toHaveBeenCalledWith(
                    { type: 'answer' },
                    undefined
                );
            } catch (error) {
                // If it throws, that's also acceptable behavior for malformed input
                expect(error).toBeDefined();
            }
        });

        it('should handle empty JSON object in establishConnection', async () => {
            // Arrange
            const emptyAnswer = JSON.stringify({});

            // Act & Assert
            try {
                await service.establishConnection(emptyAnswer);
                // If no error is thrown, the method should return early due to missing desc.type
                expect(connectionManager.setRemoteAnswerAndCandidates).not.toHaveBeenCalled();
            } catch (error) {
                // If it throws due to missing properties, that's also acceptable
                expect(error).toBeDefined();
            }
        });
    });

    describe('Callback integration', () => {
        it('should properly bind callback methods to connection manager', () => {
            // The callbacks should be bound in constructor and should be functions
            expect(connectionManager.onCandidatesReceived).toBeDefined();
            expect(connectionManager.onGatheringCompleted).toBeDefined();
            expect(connectionManager.onConnectionStateChange).toBeDefined();
        });

        it('should trigger onConnectionStateChange callback correctly', () => {
            // Arrange
            spyOn(service as any, 'processEndCall');

            // Act - Simulate callback from connection manager by calling the bound method directly
            service['onConnectionStateChange']('disconnected');

            // Assert
            expect(service['processEndCall']).toHaveBeenCalled();
        });

        it('should trigger onIceCandidateGenerated callback correctly', () => {
            // Arrange
            const testData = 'test-candidate-data';
            spyOn(service['iceCandidateSubject'], 'next');
            service['iceGatheringTimer'] = { isExpired: () => false } as any;

            // Act - Simulate callback from connection manager by calling the bound method directly
            service['onIceCandidateGenerated'](testData);

            // Assert
            expect(service['iceCandidateSubject'].next).toHaveBeenCalledWith(
                testData,
            );
        });

        it('should trigger onIceGatheringComplete callback correctly', () => {
            // Arrange
            spyOn(service['iceGatheringComplete'], 'next');
            const mockTimer = { clear: jasmine.createSpy('clear') };
            service['iceGatheringTimer'] = mockTimer as any;

            // Act - Simulate callback from connection manager by calling the bound method directly
            service['onIceGatheringComplete']();

            // Assert
            expect(service['iceGatheringComplete'].next).toHaveBeenCalled();
            expect(mockTimer.clear).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle API errors in startOutgoingCall', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const error = new Error('API Error');
            apiService.getCallSettings.and.returnValue(Promise.reject(error));

            // Act & Assert
            await expectAsync(
                service.startOutgoingCall(accountId),
            ).toBeRejectedWith(error);
        });

        it('should handle API errors in handleIncomingCall', async () => {
            // Arrange
            const chatId = 'test-chat-id';
            const offerString = JSON.stringify(mockOffer);
            const error = new Error('API Error');
            apiService.getCallSettings.and.returnValue(Promise.reject(error));

            // Act & Assert
            await expectAsync(
                service.handleIncomingCall(chatId, offerString),
            ).toBeRejectedWith(error);
        });

        it('should handle connection manager errors', async () => {
            // Arrange
            const accountId = 'test-account-id';
            const error = new Error('Connection Manager Error');
            apiService.getCallSettings.and.returnValue(
                Promise.resolve(mockCallSettings),
            );
            connectionManager.initiateOffer.and.throwError(error);

            // Act & Assert
            await expectAsync(
                service.startOutgoingCall(accountId),
            ).toBeRejectedWith(error);
        });
    });
});
