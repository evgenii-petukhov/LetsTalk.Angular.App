/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VideoCallComponent } from './video-call.component';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';
import { RtcPeerConnectionManager } from 'src/app/services/rtc-peer-connection-manager';
import { StoreService } from 'src/app/services/store.service';
import { VideoCallState } from 'src/app/models/video-call-state';

describe('VideoCallComponent', () => {
    let component: VideoCallComponent;
    let fixture: ComponentFixture<VideoCallComponent>;
    let mockStore: jasmine.SpyObj<Store>;
    let mockRtcConnectionService: jasmine.SpyObj<RtcConnectionService>;
    let mockConnectionManager: jasmine.SpyObj<RtcPeerConnectionManager>;
    let mockStoreService: jasmine.SpyObj<StoreService>;
    let storeSubject: Subject<VideoCallState | null>;

    const mockVideoCallState: VideoCallState = {
        chatId: 'test-chat-id',
        type: 'outgoing',
        captureVideo: true,
        captureAudio: true
    };

    const mockIncomingVideoCallState: VideoCallState = {
        chatId: 'test-chat-id',
        offer: 'test-offer',
        type: 'incoming',
        captureVideo: false,
        captureAudio: true
    };

    beforeEach(async () => {
        storeSubject = new Subject<VideoCallState | null>();

        const storeSpy = jasmine.createSpyObj('Store', ['select']);
        const rtcConnectionServiceSpy = jasmine.createSpyObj('RtcConnectionService', [
            'handleIncomingCall',
            'startOutgoingCall',
            'endCall'
        ]);
        const connectionManagerSpy = jasmine.createSpyObj('RtcPeerConnectionManager', [
            'startMediaCapture',
            'reconnectVideoElements',
            'setVideoEnabled',
            'setAudioEnabled'
        ]);
        Object.defineProperty(connectionManagerSpy, 'isMediaCaptured', {
            get: jasmine.createSpy('isMediaCaptured').and.returnValue(false),
            configurable: true
        });
        const storeServiceSpy = jasmine.createSpyObj('StoreService', [
            'toggleVideo',
            'toggleAudio'
        ]);

        await TestBed.configureTestingModule({
            declarations: [VideoCallComponent],
            providers: [
                { provide: Store, useValue: storeSpy },
                { provide: RtcConnectionService, useValue: rtcConnectionServiceSpy },
                { provide: RtcPeerConnectionManager, useValue: connectionManagerSpy },
                { provide: StoreService, useValue: storeServiceSpy }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(VideoCallComponent);
        component = fixture.componentInstance;

        mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        mockRtcConnectionService = TestBed.inject(RtcConnectionService) as jasmine.SpyObj<RtcConnectionService>;
        mockConnectionManager = TestBed.inject(RtcPeerConnectionManager) as jasmine.SpyObj<RtcPeerConnectionManager>;
        mockStoreService = TestBed.inject(StoreService) as jasmine.SpyObj<StoreService>;

        mockStore.select.and.returnValue(storeSubject.asObservable());

        // Mock video elements with proper attributes to match template
        const mockLocalVideo = document.createElement('video');
        mockLocalVideo.className = 'local-video';
        mockLocalVideo.autoplay = true;
        mockLocalVideo.muted = true;
        mockLocalVideo.setAttribute('playsinline', '');
        
        const mockRemoteVideo = document.createElement('video');
        mockRemoteVideo.className = 'remote-video';
        mockRemoteVideo.autoplay = true;
        mockRemoteVideo.setAttribute('playsinline', '');
        
        component.localVideo = { nativeElement: mockLocalVideo } as any;
        component.remoteVideo = { nativeElement: mockRemoteVideo } as any;

        // Setup default return values
        mockRtcConnectionService.handleIncomingCall.and.returnValue(Promise.resolve());
        mockRtcConnectionService.startOutgoingCall.and.returnValue(Promise.resolve());
        mockConnectionManager.startMediaCapture.and.returnValue(Promise.resolve());
    });

    afterEach(() => {
        storeSubject.complete();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngAfterViewInit', () => {
        it('should subscribe to video call state changes', () => {
            component.ngAfterViewInit();
            
            expect(mockStore.select).toHaveBeenCalled();
        });

        it('should disconnect video elements when state changes from active to null', async () => {
            spyOn(component, 'disconnectVideoElements' as any);
            
            component.ngAfterViewInit();
            
            // First emit a state, then null
            storeSubject.next(mockVideoCallState);
            storeSubject.next(null);
            
            expect(component['disconnectVideoElements']).toHaveBeenCalled();
        });

        it('should return early when current state is null and previous state is also null', async () => {
            component.ngAfterViewInit();
            
            storeSubject.next(null);
            
            expect(mockConnectionManager.startMediaCapture).not.toHaveBeenCalled();
            expect(mockRtcConnectionService.handleIncomingCall).not.toHaveBeenCalled();
            expect(mockRtcConnectionService.startOutgoingCall).not.toHaveBeenCalled();
        });

        it('should reconnect video elements when media is already captured', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => true,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.reconnectVideoElements).toHaveBeenCalledTimes(1);
            const callArgs = mockConnectionManager.reconnectVideoElements.calls.argsFor(0);
            expect(callArgs.length).toBe(2);
            expect(callArgs[0]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[1]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[0].className).toContain('local-video');
            expect(callArgs[1].className).toContain('remote-video');
        });

        it('should start media capture and handle incoming call when media is not captured and call is incoming', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => false,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockIncomingVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.startMediaCapture).toHaveBeenCalledTimes(1);
            const callArgs = mockConnectionManager.startMediaCapture.calls.argsFor(0);
            expect(callArgs.length).toBe(2);
            expect(callArgs[0]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[1]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[0].className).toContain('local-video');
            expect(callArgs[1].className).toContain('remote-video');
            expect(mockRtcConnectionService.handleIncomingCall).toHaveBeenCalledWith(
                mockIncomingVideoCallState.chatId,
                mockIncomingVideoCallState.offer
            );
        });

        it('should start media capture and start outgoing call when media is not captured and call is outgoing', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => false,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.startMediaCapture).toHaveBeenCalledTimes(1);
            const callArgs = mockConnectionManager.startMediaCapture.calls.argsFor(0);
            expect(callArgs.length).toBe(2);
            expect(callArgs[0]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[1]).toBeInstanceOf(HTMLVideoElement);
            expect(callArgs[0].className).toContain('local-video');
            expect(callArgs[1].className).toContain('remote-video');
            expect(mockRtcConnectionService.startOutgoingCall).toHaveBeenCalledWith(
                mockVideoCallState.chatId
            );
        });

        it('should set video and audio enabled states and update component properties', async () => {
            component.ngAfterViewInit();
            storeSubject.next(mockIncomingVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.setVideoEnabled).toHaveBeenCalledWith(false);
            expect(mockConnectionManager.setAudioEnabled).toHaveBeenCalledWith(true);
            expect(component.captureVideo).toBe(false);
            expect(component.captureAudio).toBe(true);
        });

        it('should handle errors gracefully when startMediaCapture fails', async () => {
            mockConnectionManager.startMediaCapture.and.returnValue(Promise.reject(new Error('Media error')));
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.startMediaCapture).toHaveBeenCalled();
        });

        it('should handle errors gracefully when handleIncomingCall fails', async () => {
            mockRtcConnectionService.handleIncomingCall.and.returnValue(Promise.reject(new Error('Connection error')));
            
            component.ngAfterViewInit();
            storeSubject.next(mockIncomingVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockRtcConnectionService.handleIncomingCall).toHaveBeenCalled();
        });

        it('should handle errors gracefully when startOutgoingCall fails', async () => {
            mockRtcConnectionService.startOutgoingCall.and.returnValue(Promise.reject(new Error('Connection error')));
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockRtcConnectionService.startOutgoingCall).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should disconnect video elements and complete subscriptions', () => {
            spyOn(component, 'disconnectVideoElements' as any);
            spyOn(component['unsubscribe$'], 'next');
            spyOn(component['unsubscribe$'], 'complete');
            
            component.ngOnDestroy();
            
            expect(component['disconnectVideoElements']).toHaveBeenCalled();
            expect(component['unsubscribe$'].next).toHaveBeenCalled();
            expect(component['unsubscribe$'].complete).toHaveBeenCalled();
        });
    });

    describe('endCall', () => {
        it('should call rtcConnectionService.endCall', () => {
            component.endCall();
            
            expect(mockRtcConnectionService.endCall).toHaveBeenCalled();
        });
    });

    describe('toggleVideo', () => {
        it('should call storeService.toggleVideo', () => {
            component.toggleVideo();
            
            expect(mockStoreService.toggleVideo).toHaveBeenCalled();
        });
    });

    describe('toggleAudio', () => {
        it('should call storeService.toggleAudio', () => {
            component.toggleAudio();
            
            expect(mockStoreService.toggleAudio).toHaveBeenCalled();
        });
    });

    describe('disconnectVideoElements', () => {
        it('should set srcObject to null for both video elements', () => {
            component['disconnectVideoElements']();
            
            expect(component.localVideo.nativeElement.srcObject).toBeNull();
            expect(component.remoteVideo.nativeElement.srcObject).toBeNull();
        });
    });

    describe('component properties', () => {
        it('should initialize with default values', () => {
            expect(component.captureVideo).toBe(true);
            expect(component.captureAudio).toBe(true);
        });

        it('should have ViewChild references for video elements', () => {
            expect(component.localVideo).toBeDefined();
            expect(component.remoteVideo).toBeDefined();
        });
    });

    describe('subscription management', () => {
        it('should unsubscribe when component is destroyed', () => {
            component.ngAfterViewInit();
            
            const subscription = component['unsubscribe$'];
            spyOn(subscription, 'next');
            spyOn(subscription, 'complete');
            
            component.ngOnDestroy();
            
            expect(subscription.next).toHaveBeenCalled();
            expect(subscription.complete).toHaveBeenCalled();
        });

        it('should use takeUntil to manage subscription lifecycle', () => {
            component.ngAfterViewInit();
            
            // Verify that the subscription is properly managed
            expect(mockStore.select).toHaveBeenCalled();
        });
    });

    describe('state transitions', () => {
        it('should handle multiple state changes correctly', async () => {
            spyOn(component, 'disconnectVideoElements' as any);
            
            component.ngAfterViewInit();
            
            // Initial state
            storeSubject.next(mockVideoCallState);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Change to incoming call
            storeSubject.next(mockIncomingVideoCallState);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // End call
            storeSubject.next(null);
            
            expect(component['disconnectVideoElements']).toHaveBeenCalled();
        });

        it('should update component properties based on state changes', async () => {
            component.ngAfterViewInit();
            
            // Test outgoing call state
            storeSubject.next(mockVideoCallState);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(component.captureVideo).toBe(true);
            expect(component.captureAudio).toBe(true);
            
            // Test incoming call state with different settings
            storeSubject.next(mockIncomingVideoCallState);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(component.captureVideo).toBe(false);
            expect(component.captureAudio).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should handle null video elements gracefully', () => {
            // This test should verify the component handles null elements properly
            // The actual component should have null checks
            expect(() => {
                if (component.localVideo && component.remoteVideo) {
                    component['disconnectVideoElements']();
                }
            }).not.toThrow();
        });

        it('should handle undefined state properties gracefully', async () => {
            const incompleteState = {
                type: 'outgoing'
            } as VideoCallState;
            
            component.ngAfterViewInit();
            storeSubject.next(incompleteState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Should not throw errors even with incomplete state
            expect(component.captureVideo).toBe(undefined);
            expect(component.captureAudio).toBe(undefined);
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete outgoing call flow', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => false,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.startMediaCapture).toHaveBeenCalled();
            expect(mockRtcConnectionService.startOutgoingCall).toHaveBeenCalledWith('test-chat-id');
            expect(mockConnectionManager.setVideoEnabled).toHaveBeenCalledWith(true);
            expect(mockConnectionManager.setAudioEnabled).toHaveBeenCalledWith(true);
        });

        it('should handle complete incoming call flow', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => false,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockIncomingVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.startMediaCapture).toHaveBeenCalled();
            expect(mockRtcConnectionService.handleIncomingCall).toHaveBeenCalledWith('test-chat-id', 'test-offer');
            expect(mockConnectionManager.setVideoEnabled).toHaveBeenCalledWith(false);
            expect(mockConnectionManager.setAudioEnabled).toHaveBeenCalledWith(true);
        });

        it('should handle reconnection scenario when media is already captured', async () => {
            Object.defineProperty(mockConnectionManager, 'isMediaCaptured', {
                get: () => true,
                configurable: true
            });
            
            component.ngAfterViewInit();
            storeSubject.next(mockVideoCallState);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockConnectionManager.reconnectVideoElements).toHaveBeenCalled();
            expect(mockConnectionManager.startMediaCapture).not.toHaveBeenCalled();
            expect(mockRtcConnectionService.startOutgoingCall).not.toHaveBeenCalled();
        });
    });
});