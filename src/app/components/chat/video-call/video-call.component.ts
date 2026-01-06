import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { VideoCallType } from 'src/app/models/video-call-type';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';
import { RtcPeerConnectionManager } from 'src/app/services/rtc-peer-connection-manager';
import { StoreService } from 'src/app/services/store.service';
import { selectVideoCall } from 'src/app/state/video-call/video-call.selectors';

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

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);
    private readonly connectionManager = inject(RtcPeerConnectionManager);
    private readonly storeService = inject(StoreService);

    ngAfterViewInit(): void {
        this.store
            .select(selectVideoCall)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (state) => {
                if (state === null) return;

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
                    if (state.type === 'incoming') {
                        await this.rtcConnectionService.handleIncomingCall(
                            state.chatId,
                            state.offer,
                        );
                    } else {
                        await this.rtcConnectionService.startOutgoingCall(
                            state.chatId,
                        );
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this.localVideo.nativeElement.srcObject = null;
        this.remoteVideo.nativeElement.srcObject = null;

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    endCall(): void {
        this.connectionManager.endCall();
        this.localVideo.nativeElement.srcObject = null;
        this.remoteVideo.nativeElement.srcObject = null;
        this.storeService.initVideoCall(null);
    }
}
