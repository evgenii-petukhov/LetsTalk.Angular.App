import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from 'src/app/models/message-list-status';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: false,
})
export class ChatComponent implements OnInit, OnDestroy {
    isMessageListVisible = false;
    isComposeAreaVisible = false;
    isNotFoundVisible = false;
    isErrorVisible = false;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);

    ngOnInit(): void {
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async () => {
                this.setMessageListVisibility(MessageListStatus.Unknown);
            });
    }

    ngOnDestroy(): void {
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
        this.isComposeAreaVisible =
            status === MessageListStatus.Success;
        this.isNotFoundVisible = status === MessageListStatus.NotFound;
        this.isErrorVisible = status === MessageListStatus.Error;
    }
}
