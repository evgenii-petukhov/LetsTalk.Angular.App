import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from 'src/app/models/message-list-status';
import { StoreService } from 'src/app/services/store.service';
import {
    selectSelectedChatIsCallInProgress,
    selectSelectedChatIsComposeAreaVisible,
    selectSelectedChatIsErrorVisible,
    selectSelectedChatIsMessageListVisible,
    selectSelectedChatIsNotFoundVisible,
} from 'src/app/state/selected-chat-ui/selected-chat-ui.selectors';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: false,
})
export class ChatComponent implements OnInit, OnDestroy {
    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly storeService = inject(StoreService);

    ngOnInit(): void {
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.storeService.setSelectedChatMessageListStatus(
                    MessageListStatus.Unknown,
                );
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isCallInProgress$ = this.store.select(selectSelectedChatIsCallInProgress);
    isMessageListVisible$ = this.store.select(
        selectSelectedChatIsMessageListVisible,
    );
    isComposeAreaVisible$ = this.store.select(
        selectSelectedChatIsComposeAreaVisible,
    );
    isNotFoundVisible$ = this.store.select(selectSelectedChatIsNotFoundVisible);
    isErrorVisible$ = this.store.select(selectSelectedChatIsErrorVisible);

    onStatusChanged(status: MessageListStatus): void {
        this.storeService.setSelectedChatMessageListStatus(status);
    }
}
