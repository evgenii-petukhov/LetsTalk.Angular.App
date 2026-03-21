import { Component, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
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
    private chatId = toSignal(this.store.select(selectVideoCallChatId));

    @HostListener('click')
    async handleClick(): Promise<void> {
        await this.router.navigate(['/messenger/chat', this.chatId()]);
    }
}
