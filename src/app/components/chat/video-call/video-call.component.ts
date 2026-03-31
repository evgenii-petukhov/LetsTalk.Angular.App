import {
    AfterViewInit,
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { pairwise, startWith, Subject, takeUntil } from 'rxjs';
import { RtcConnectionService } from '../../../services/rtc-connection.service';
import { RtcPeerConnectionManager } from '../../../services/rtc-peer-connection-manager';
import { StoreService } from '../../../services/store.service';
import {
    selectCaptureAudio,
    selectCaptureVideo,
    selectVideoCall,
} from '../../../state/video-call/video-call.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { VideoWithAvatarFallbackComponent } from '../video-with-avatar-fallback/video-with-avatar-fallback.component';
import { IProfileDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.component.html',
    styleUrl: './video-call.component.scss',
    standalone: false,
})
export class VideoCallComponent implements OnDestroy, AfterViewInit, OnInit {
    @ViewChild('localVideo', { static: false })
    localVideo!: VideoWithAvatarFallbackComponent;
    @ViewChild('remoteVideo', { static: false })
    remoteVideo!: VideoWithAvatarFallbackComponent;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);
    private readonly storeService = inject(StoreService);

    captureVideo = toSignal(this.store.select(selectCaptureVideo));
    captureAudio = toSignal(this.store.select(selectCaptureAudio));

    localAccount = signal<IProfileDto>(null);
    localUrlOptions = computed(() => [this.localAccount()?.image, this.localAccount()?.photoUrl]);

    async ngOnInit(): Promise<void> {
        const loggedInUser = await this.storeService.getLoggedInUser();
        this.localAccount.set(loggedInUser);
    }

    ngAfterViewInit(): void {
        this.store
            .select(selectVideoCall)
            .pipe(startWith(null), pairwise(), takeUntil(this.unsubscribe$))
            .subscribe(async ([prevState, currentState]) => {
                if (currentState === null) {
                    if (prevState !== null) {
                        this.disconnectVideoElements();
                    }
                    return;
                }

                if (prevState === null) {
                    if (this.connectionManager.isMediaCaptured) {
                        this.connectionManager.reconnectVideoElements({
                            local: this.localVideo.getVideoElement(),
                            remote: this.remoteVideo.getVideoElement(),
                        });
                    } else {
                        try {
                            await this.connectionManager.startMediaCapture(
                                this.localVideo.getVideoElement(),
                                this.remoteVideo.getVideoElement(),
                            );
                            if (currentState.status === 'incoming-active') {
                                await this.rtcConnectionService.handleIncomingCall(
                                    currentState.callId,
                                    currentState.chatId,
                                    currentState.offer,
                                );
                            } else if (currentState.status === 'outgoing') {
                                await this.rtcConnectionService.startOutgoingCall(
                                    currentState.chatId,
                                );
                            }
                        } catch (error) {
                            console.error('Video call error:', error);
                        }
                    }
                }

                this.connectionManager.setVideoEnabled(
                    currentState.captureVideo,
                );
                this.connectionManager.setAudioEnabled(
                    currentState.captureAudio,
                );
            });
    }

    ngOnDestroy(): void {
        this.disconnectVideoElements();

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    endCall(): void {
        this.rtcConnectionService.endCall();
    }

    toggleCaptureVideo(): void {
        this.storeService.toggleCaptureVideo();
    }

    toggleCaptureAudio(): void {
        this.storeService.toggleCaptureAudio();
    }

    minimizeCall(): void {
        this.storeService.minimizeCall();
    }

    private disconnectVideoElements(): void {
        this.localVideo.resetVideoElement();
        this.remoteVideo.resetVideoElement();
    }
}
