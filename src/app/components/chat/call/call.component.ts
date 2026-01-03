import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { VideoCallState } from 'src/app/models/video-call-state';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';
import { RtcPeerConnectionManager } from 'src/app/services/rtc-peer-connection-manager';
import { selectVideoCall } from 'src/app/state/video-call/video-call.selectors';

@Component({
    selector: 'app-call',
    templateUrl: './call.component.html',
    styleUrl: './call.component.scss',
    standalone: false,
})
export class CallComponent implements OnInit, OnDestroy {
    @ViewChild('localVideo', { static: false })
    localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('remoteVideo', { static: false })
    remoteVideo!: ElementRef<HTMLVideoElement>;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private mediaStream: MediaStream | null = null;
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);

    state: VideoCallState = null;

    ngOnInit(): void {
        this.store
            .select(selectVideoCall)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (state) => {
                if (this.state === null) {
                    await this.initializeMediaStream();
                    if (state.isIncoming) {
                        await this.rtcConnectionService.handleIncomingCall(state.accountId, state.offer);
                    } else {
                        await this.rtcConnectionService.startOutgoingCall(state.accountId);
                    }
                }
                this.state = state;
            });
    }

    ngOnDestroy(): void {
        this.connectionManager.stopTrackingStream(this.mediaStream);

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private async initializeMediaStream(): Promise<void> {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            this.localVideo.nativeElement.srcObject = this.mediaStream;
            this.connectionManager.startTrackingStream(
                this.mediaStream,
                (e) => {
                    if (this.remoteVideo.nativeElement.srcObject) return;
                    this.remoteVideo.nativeElement.srcObject = e.streams[0];
                },
            );
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }
}
