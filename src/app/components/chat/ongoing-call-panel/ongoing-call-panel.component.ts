import { Component, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { faPhoneVolume } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';
import { StoreService } from 'src/app/services/store.service';
import {
    selectIsAwaitingResponseButtonVisible,
    selectIsOngoingCallControlSetVisible,
} from 'src/app/state/selected-chat/selected-chat.selector';
import {
    selectCaptureAudio,
    selectCaptureVideo,
    selectVideoCallChat,
} from 'src/app/state/video-call/video-call.selectors';

@Component({
    selector: 'app-ongoing-call-panel',
    templateUrl: './ongoing-call-panel.component.html',
    styleUrl: './ongoing-call-panel.component.scss',
    standalone: false,
})
export class OngoingCallComponent {
    private readonly router = inject(Router);
    private readonly store = inject(Store);
    private readonly storeService = inject(StoreService);
    private readonly rtcConnectionService = inject(RtcConnectionService);

    chat = toSignal(this.store.select(selectVideoCallChat));
    isAwaitingResponseButtonVisible = toSignal(
        this.store.select(selectIsAwaitingResponseButtonVisible),
    );
    isCallControlSetVisible = toSignal(
        this.store.select(selectIsOngoingCallControlSetVisible),
    );
    captureVideo = toSignal(this.store.select(selectCaptureVideo));
    captureAudio = toSignal(this.store.select(selectCaptureAudio));

    faPhoneVolume = faPhoneVolume;

    @HostListener('click')
    async onPanelClick(): Promise<void> {
        const chat = this.chat();
        if (chat) {
            await this.router.navigate(['/messenger/chat', chat.id]);
        }
    }

    onAcceptClicked(e: MouseEvent): void {
        e.stopPropagation();
        this.storeService.acceptIncomingCall();
    }

    onDeclineClicked(e: MouseEvent): void {
        e.stopPropagation();
        this.storeService.resetCall();
    }

    toggleCaptureVideo(e: MouseEvent) {
        e.stopPropagation();
        this.storeService.toggleCaptureVideo();
    }

    toggleCaptureAudio(e: MouseEvent) {
        e.stopPropagation();
        this.storeService.toggleCaptureAudio();
    }

    endCall(e: MouseEvent): void {
        e.stopPropagation();
        this.rtcConnectionService.endCall();
    }
}
