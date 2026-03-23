import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { selectVideoCallChatId } from 'src/app/state/video-call/video-call.selectors';

@Component({
    selector: 'app-ongoing-call-panel',
    templateUrl: './ongoing-call-panel.component.html',
    styleUrl: './ongoing-call-panel.component.scss',
    standalone: false,
})
export class OngoingCallComponent {
    private readonly router = inject(Router);
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);
    private chatId = toSignal(this.store.select(selectVideoCallChatId));
    private chat = toSignal(this.store.select(selectSelectedChat), { initialValue: null });

    urlOptions = computed(() => {
        const chat = this.chat();
        return chat && [chat.image, chat.photoUrl];
    });

    async onChatClick(): Promise<void> {
        const chatId = this.chatId();
        if (chatId) {
            await this.router.navigate(['/messenger/chat', chatId]);
        }
    }

    endCall(): void {
        this.rtcConnectionService.endCall();
    }
}
