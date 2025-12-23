import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { BackButtonStatus } from 'src/app/models/back-button-status';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { RtcConnectionService } from 'src/app/services/rtc-connection.service';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss'],
    standalone: false,
})
export class ChatHeaderComponent implements OnInit, OnDestroy {
    chat: IChatDto;
    faPhone = faPhone;
    @Input() backButton: BackButtonStatus;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly rtcConnectionService = inject(RtcConnectionService);

    ngOnInit(): void {
        this.store
            .select(selectSelectedChat)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((chat) => {
                this.chat = chat;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async onCallClicked(): Promise<void> {
        return this.rtcConnectionService.initializeCallAsync(this.chat.accountIds[0]);
    }
}
