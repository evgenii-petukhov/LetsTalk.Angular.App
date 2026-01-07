/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { IceCandidateMetricsService } from './ice-candidate-metrics.service';
import { RtcPeerConnectionManager } from './rtc-peer-connection-manager';

describe('RtcPeerConnectionManager', () => {
    let service: RtcPeerConnectionManager;
    let iceCandidateMetricsService: jasmine.SpyObj<IceCandidateMetricsService>;
    let mockConnection: jasmine.SpyObj<RTCPeerConnection>;
    let mockMediaStream: jasmine.SpyObj<MediaStream>;
    let mockTrack: jasmine.SpyObj<MediaStreamTrack>;

    const mockConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const mockOffer: RTCSessionDescriptionInit = {
        type: 'offer',
        sdp: 'mock-offer-sdp',
    };

    const mockAnswer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: 'mock-answer-sdp',
    };

    const mockCandidate: RTCIceCandidateInit = {
        candidate: 'candidate:1 1 UDP 2130706431 192.168.1.1 54400 typ host',
        sdpMLineIndex: 0,
        sdpMid: '0',
    };

    beforeEach(() => {
        // Mock RTCPeerConnection
        mockConnection = jasmine.createSpyObj(
            'RTCPeerConnection',
            [
                'setConfiguration',
                'createOffer',
                'createAnswer',
                'setLocalDescription',
                'setRemoteDescription',
                'addIceCandidate',
                'addTrack',
                'close',
            ],
            {
                signalingState: 'stable',
                localDescription: null,
            },
        );

        (mockConnection.createOffer as jasmine.Spy).and.returnValue(
            Promise.resolve(mockOffer as RTCSessionDescription),
        );
        (mockConnection.createAnswer as jasmine.Spy).and.returnValue(
            Promise.resolve(mockAnswer as RTCSessionDescription),
        );
        (mockConnection.setLocalDescription as jasmine.Spy).and.returnValue(
            Promise.resolve(),
        );
        (mockConnection.setRemoteDescription as jasmine.Spy).and.returnValue(
            Promise.resolve(),
        );
        (mockConnection.addIceCandidate as jasmine.Spy).and.returnValue(
            Promise.resolve(),
        );

        // Mock MediaStream and MediaStreamTrack
        mockTrack = jasmine.createSpyObj('MediaStreamTrack', ['stop']);
        mockMediaStream = jasmine.createSpyObj('MediaStream', ['getTracks']);
        mockMediaStream.getTracks.and.returnValue([mockTrack]);

        // Mock navigator.mediaDevices.getUserMedia
        spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
            Promise.resolve(mockMediaStream),
        );

        // Mock global RTCPeerConnection constructor
        spyOn(window, 'RTCPeerConnection').and.returnValue(mockConnection);

        iceCandidateMetricsService = jasmine.createSpyObj(
            'IceCandidateMetricsService',
            [
                'hasMinimumCandidateCount',
                'hasSufficientServers',
            ],
        );

        TestBed.configureTestingModule({
            providers: [
                RtcPeerConnectionManager,
                {
                    provide: IceCandidateMetricsService,
                    useValue: iceCandidateMetricsService,
                },
            ],
        });

        service = TestBed.inject(RtcPeerConnectionManager);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(window.RTCPeerConnection).toHaveBeenCalled();
        expect(mockConnection.onicecandidate).toBeDefined();
    });

    describe('initiateOffer', () => {
        it('should create and set local offer', async () => {
            // Act
            await service.initiateOffer(mockConfig);

            // Assert
            expect(mockConnection.setConfiguration).toHaveBeenCalledWith(
                mockConfig,
            );
            expect(mockConnection.createOffer).toHaveBeenCalled();
            expect(mockConnection.setLocalDescription).toHaveBeenCalled();
            expect(service['isGathering']).toBe(true);
            expect(service['localCandidates']).toEqual([]);
        });
    });

    describe('handleOfferAndCreateAnswer', () => {
        it('should handle offer and create answer', async () => {
            // Arrange
            const candidates = [mockCandidate];

            // Act
            await service.handleOfferAndCreateAnswer(
                mockConfig,
                mockOffer,
                candidates,
            );

            // Assert
            expect(mockConnection.setConfiguration).toHaveBeenCalledWith(
                mockConfig,
            );
            expect(mockConnection.setRemoteDescription).toHaveBeenCalled();
            expect(mockConnection.addIceCandidate).toHaveBeenCalled();
            expect(mockConnection.createAnswer).toHaveBeenCalled();
            expect(mockConnection.setLocalDescription).toHaveBeenCalled();
            expect(service['isGathering']).toBe(true);
            expect(service['localCandidates']).toEqual([]);
        });

        it('should handle offer without candidates', async () => {
            // Act
            await service.handleOfferAndCreateAnswer(
                mockConfig,
                mockOffer,
                null,
            );

            // Assert
            expect(mockConnection.setRemoteDescription).toHaveBeenCalled();
            expect(mockConnection.addIceCandidate).not.toHaveBeenCalled();
            expect(mockConnection.createAnswer).toHaveBeenCalled();
        });
    });

    describe('requestCompleteGathering', () => {
        it('should return early if minimum candidate count not met', () => {
            // Arrange
            iceCandidateMetricsService.hasMinimumCandidateCount.and.returnValue(
                false,
            );

            // Act
            service.requestCompleteGathering();

            // Assert
            expect(
                iceCandidateMetricsService.hasMinimumCandidateCount,
            ).toHaveBeenCalledWith([]);
            expect(
                iceCandidateMetricsService.hasSufficientServers,
            ).not.toHaveBeenCalled();
        });

        it('should finalize gathering if sufficient servers available', () => {
            // Arrange
            iceCandidateMetricsService.hasMinimumCandidateCount.and.returnValue(
                true,
            );
            iceCandidateMetricsService.hasSufficientServers.and.returnValue(
                true,
            );
            service.onGatheringCompleted = jasmine.createSpy(
                'onGatheringCompleted',
            );

            // Act
            service.requestCompleteGathering();

            // Assert
            expect(
                iceCandidateMetricsService.hasSufficientServers,
            ).toHaveBeenCalledWith([]);
            expect(service['isGathering']).toBe(false);
            expect(service.onGatheringCompleted).toHaveBeenCalled();
        });

        it('should not finalize gathering if insufficient servers', () => {
            // Arrange
            iceCandidateMetricsService.hasMinimumCandidateCount.and.returnValue(
                true,
            );
            iceCandidateMetricsService.hasSufficientServers.and.returnValue(
                false,
            );
            service.onGatheringCompleted = jasmine.createSpy(
                'onGatheringCompleted',
            );

            // Act
            service.requestCompleteGathering();

            // Assert
            expect(service['isGathering']).toBe(true);
            expect(service.onGatheringCompleted).not.toHaveBeenCalled();
        });
    });

    describe('setRemoteAnswerAndCandidates', () => {
        it('should set remote answer and candidates when in correct state', async () => {
            // Arrange
            Object.defineProperty(mockConnection, 'signalingState', {
                value: 'have-local-offer',
                writable: true,
            });
            const candidates = [mockCandidate];

            // Act
            await service.setRemoteAnswerAndCandidates(mockAnswer, candidates);

            // Assert
            expect(mockConnection.setRemoteDescription).toHaveBeenCalled();
            expect(mockConnection.addIceCandidate).toHaveBeenCalled();
        });

        it('should return early if not in have-local-offer state', async () => {
            // Arrange
            Object.defineProperty(mockConnection, 'signalingState', {
                value: 'stable',
                writable: true,
            });

            // Act
            await service.setRemoteAnswerAndCandidates(mockAnswer, [
                mockCandidate,
            ]);

            // Assert
            expect(mockConnection.setRemoteDescription).not.toHaveBeenCalled();
            expect(mockConnection.addIceCandidate).not.toHaveBeenCalled();
        });

        it('should handle null candidates', async () => {
            // Arrange
            Object.defineProperty(mockConnection, 'signalingState', {
                value: 'have-local-offer',
                writable: true,
            });

            // Act
            await service.setRemoteAnswerAndCandidates(mockAnswer, null);

            // Assert
            expect(mockConnection.setRemoteDescription).toHaveBeenCalled();
            expect(mockConnection.addIceCandidate).not.toHaveBeenCalled();
        });
    });

    describe('startMediaCapture', () => {
        let mockLocalVideo: any;
        let mockRemoteVideo: any;

        beforeEach(() => {
            mockLocalVideo = { srcObject: null };
            mockRemoteVideo = { srcObject: null };
        });

        it('should start media capture successfully', async () => {
            // Arrange
            service.onCandidatesReceived = jasmine.createSpy(
                'onCandidatesReceived',
            );

            // Act
            await service.startMediaCapture(mockLocalVideo, mockRemoteVideo);

            // Assert
            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
                video: true,
                audio: true,
            });
            expect(mockLocalVideo.srcObject).toBe(mockMediaStream);
            expect(mockConnection.addTrack).toHaveBeenCalledWith(
                mockTrack,
                mockMediaStream,
            );
            expect(mockConnection.ontrack).toBeDefined();
            expect(service.isMediaCaptured).toBe(true);
        });

        it('should handle media capture error', async () => {
            // Arrange
            const error = new Error('Media access denied');
            (navigator.mediaDevices.getUserMedia as jasmine.Spy).and.rejectWith(
                error,
            );
            spyOn(console, 'error');

            // Act
            await service.startMediaCapture(mockLocalVideo, mockRemoteVideo);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'Error accessing media devices:',
                error,
            );
            expect(service.isMediaCaptured).toBe(false);
        });

        it('should handle ontrack event', async () => {
            // Arrange
            const mockRemoteStream = jasmine.createSpyObj('MediaStream', [
                'getTracks',
            ]);
            const mockTrackEvent = {
                streams: [mockRemoteStream],
                track: mockTrack,
                receiver: {} as RTCRtpReceiver,
                transceiver: {} as RTCRtpTransceiver,
            } as unknown as RTCTrackEvent;

            // Act
            await service.startMediaCapture(mockLocalVideo, mockRemoteVideo);
            mockConnection.ontrack!(mockTrackEvent);

            // Assert
            expect(mockRemoteVideo.srcObject).toBe(mockRemoteStream);
            expect(service['remoteMediaStream']).toBe(mockRemoteStream);
        });
    });

    describe('reconnectVideoElements', () => {
        let mockLocalVideo: any;
        let mockRemoteVideo: any;

        beforeEach(() => {
            mockLocalVideo = { srcObject: null };
            mockRemoteVideo = { srcObject: null };
        });

        it('should reconnect video elements', () => {
            // Arrange
            service['localMediaStream'] = mockMediaStream;
            service['remoteMediaStream'] = mockMediaStream;

            // Act
            service.reconnectVideoElements(mockLocalVideo, mockRemoteVideo);

            // Assert
            expect(mockLocalVideo.srcObject).toBe(mockMediaStream);
            expect(mockRemoteVideo.srcObject).toBe(mockMediaStream);
        });

        it('should handle null streams', () => {
            // Arrange
            service['localMediaStream'] = null;
            service['remoteMediaStream'] = null;

            // Act
            service.reconnectVideoElements(mockLocalVideo, mockRemoteVideo);

            // Assert
            expect(mockLocalVideo.srcObject).toBeNull();
            expect(mockRemoteVideo.srcObject).toBeNull();
        });
    });

    describe('endCall', () => {
        it('should end call and reset state', () => {
            // Arrange
            service['localMediaStream'] = mockMediaStream;
            service['remoteMediaStream'] = mockMediaStream;
            service['localCandidates'] = [mockCandidate as RTCIceCandidate];
            service['isGathering'] = false;
            service.isMediaCaptured = true;

            // Act
            service.reinitialize();

            // Assert
            expect(mockTrack.stop).toHaveBeenCalled();
            expect(mockConnection.close).toHaveBeenCalled();
            expect(window.RTCPeerConnection).toHaveBeenCalledTimes(2); // Initial + after endCall
            expect(service['remoteMediaStream']).toBeNull();
            expect(service['localCandidates']).toEqual([]);
            expect(service['isGathering']).toBe(true);
            expect(service.isMediaCaptured).toBe(false);
        });

        it('should handle null local media stream', () => {
            // Arrange
            service['localMediaStream'] = null;

            // Act
            service.reinitialize();

            // Assert
            expect(mockTrack.stop).not.toHaveBeenCalled();
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('onIceCandidateReceived', () => {
        it('should return early if not gathering', () => {
            // Arrange
            service['isGathering'] = false;
            const mockEvent = {
                candidate: mockCandidate,
            } as RTCPeerConnectionIceEvent;
            service.onCandidatesReceived = jasmine.createSpy(
                'onCandidatesReceived',
            );

            // Act
            service['onIceCandidateReceived'](mockEvent);

            // Assert
            expect(service.onCandidatesReceived).not.toHaveBeenCalled();
        });

        it('should finalize gathering when candidate is null', () => {
            // Arrange
            service['isGathering'] = true;
            const mockEvent = { candidate: null } as RTCPeerConnectionIceEvent;
            service.onGatheringCompleted = jasmine.createSpy(
                'onGatheringCompleted',
            );

            // Act
            service['onIceCandidateReceived'](mockEvent);

            // Assert
            expect(service['isGathering']).toBe(false);
            expect(service.onGatheringCompleted).toHaveBeenCalled();
        });

        it('should add candidate and call onCandidatesReceived', () => {
            // Arrange
            service['isGathering'] = true;
            const mockRTCCandidate = mockCandidate as RTCIceCandidate;
            const mockEvent = {
                candidate: mockRTCCandidate,
            } as RTCPeerConnectionIceEvent;
            Object.defineProperty(mockConnection, 'localDescription', {
                value: mockOffer as RTCSessionDescription,
                writable: true,
            });
            service.onCandidatesReceived = jasmine.createSpy(
                'onCandidatesReceived',
            );

            // Act
            service['onIceCandidateReceived'](mockEvent);

            // Assert
            expect(service['localCandidates']).toContain(mockRTCCandidate);
            expect(service.onCandidatesReceived).toHaveBeenCalledWith(
                JSON.stringify({
                    desc: mockOffer,
                    candidates: [mockRTCCandidate],
                }),
            );
        });
    });

    describe('private methods', () => {
        it('should connect local video when stream exists', () => {
            // Arrange
            const mockVideo = { srcObject: null };
            service['localMediaStream'] = mockMediaStream;

            // Act
            service['connectLocalVideo'](mockVideo as HTMLVideoElement);

            // Assert
            expect(mockVideo.srcObject).toBe(mockMediaStream);
        });

        it('should not connect local video when stream is null', () => {
            // Arrange
            const mockVideo = { srcObject: null };
            service['localMediaStream'] = null;

            // Act
            service['connectLocalVideo'](mockVideo as HTMLVideoElement);

            // Assert
            expect(mockVideo.srcObject).toBeNull();
        });

        it('should connect remote video when stream exists', () => {
            // Arrange
            const mockVideo = { srcObject: null };
            service['remoteMediaStream'] = mockMediaStream;

            // Act
            service['connectRemoteVideo'](mockVideo as HTMLVideoElement);

            // Assert
            expect(mockVideo.srcObject).toBe(mockMediaStream);
        });

    });
});
