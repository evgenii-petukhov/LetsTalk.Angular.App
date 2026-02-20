import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { pairwise, startWith, Subject, takeUntil } from 'rxjs';
import { RtcConnectionService } from '../../../services/rtc-connection.service';
import { RtcPeerConnectionManager } from '../../../services/rtc-peer-connection-manager';
import { StoreService } from '../../../services/store.service';
import { selectVideoCall } from '../../../state/video-call/video-call.selectors';

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.component.html',
    styleUrl: './video-call.component.scss',
    standalone: false,
})
export class VideoCallComponent implements OnDestroy, AfterViewInit {
    @ViewChild('localVideo', { static: false })
    localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('remoteVideo', { static: false })
    remoteVideo!: ElementRef<HTMLVideoElement>;

    captureVideo = true;
    captureAudio = true;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);
    private readonly storeService = inject(StoreService);

    ngAfterViewInit(): void {
        this.store
            .select(selectVideoCall)
            .pipe(startWith(null), pairwise(), takeUntil(this.unsubscribe$))
            .subscribe(async ([prevState, currentState]) => {
                if (prevState !== null && currentState === null) {
                    this.disconnectVideoElements();
                    return;
                }

                if (currentState === null) return;

                try {
                    if (this.connectionManager.isMediaCaptured) {
                        this.connectionManager.reconnectVideoElements(
                            this.localVideo.nativeElement,
                            this.remoteVideo.nativeElement,
                        );
                    } else {
                        await this.connectionManager.startMediaCapture(
                            this.localVideo.nativeElement,
                            this.remoteVideo.nativeElement,
                        );
                        if (currentState.type === 'incoming') {
                            await this.rtcConnectionService.handleIncomingCall(
                                currentState.callId,
                                currentState.chatId,
                                currentState.offer,
                            );
                        } else {
                            await this.rtcConnectionService.startOutgoingCall(
                                currentState.chatId,
                            );
                        }
                    }

                    this.connectionManager.setVideoEnabled(
                        currentState.captureVideo,
                    );
                    this.connectionManager.setAudioEnabled(
                        currentState.captureAudio,
                    );

                    this.captureVideo = currentState.captureVideo;
                    this.captureAudio = currentState.captureAudio;
                } catch (error) {
                    console.error('Video call error:', error);
                }
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

    toggleVideo() {
        this.storeService.toggleVideo();
    }

    toggleAudio() {
        this.storeService.toggleAudio();
    }

    private disconnectVideoElements(): void {
        this.localVideo.nativeElement.srcObject = null;
        this.remoteVideo.nativeElement.srcObject = null;
    }
}
