import {
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from 'src/app/models/message-list-status';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: false,
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild('localVideo', { static: false })
    localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild('remoteVideo', { static: false })
    remoteVideo!: ElementRef<HTMLVideoElement>;

    isMessageListVisible = false;
    isComposeAreaVisible = false;
    isNotFoundVisible = false;
    isErrorVisible = false;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private mediaStream: MediaStream | null = null;
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);

    async ngOnInit(): Promise<void> {
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async () => {
                this.setMessageListVisibility(MessageListStatus.Unknown);
            });

        // Initialize media stream
        await this.initializeMediaStream();
    }

    private async initializeMediaStream(): Promise<void> {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            this.localVideo.nativeElement.srcObject = this.mediaStream;
            const connection = this.rtcConnectionService.getConnection();
            this.mediaStream.getTracks().forEach(track => connection.addTrack(track, this.mediaStream));

            connection.ontrack = (e) => {
                if (this.remoteVideo.nativeElement.srcObject) return;
                this.remoteVideo.nativeElement.srcObject = e.streams[0];
            };

        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    ngOnDestroy(): void {
        // Clean up media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
        }

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onStatusChanged(status: MessageListStatus): void {
        this.setMessageListVisibility(status);
    }

    private setMessageListVisibility(status: MessageListStatus): void {
        this.isMessageListVisible = [
            MessageListStatus.Unknown,
            MessageListStatus.Success,
        ].includes(status);
        this.isComposeAreaVisible = status === MessageListStatus.Success;
        this.isNotFoundVisible = status === MessageListStatus.NotFound;
        this.isErrorVisible = status === MessageListStatus.Error;
    }
}
