import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from '../../models/message-list-status';
import { StoreService } from '../../services/store.service';
import {
    selectSelectedChatIsAwaitingResponse,
    selectSelectedChatIsCallInProgress,
    selectSelectedChatIsComposeAreaVisible,
    selectSelectedChatIsErrorVisible,
    selectSelectedChatIsMessageListVisible,
    selectSelectedChatIsNotFoundVisible,
} from '../../state/selected-chat-ui/selected-chat-ui.selectors';
import { selectSelectedChatId } from '../../state/selected-chat/selected-chat-id.selectors';

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

    isCallInProgress = toSignal(
        this.store.select(selectSelectedChatIsCallInProgress),
    );
    isAwaitingResponse = toSignal(
        this.store.select(selectSelectedChatIsAwaitingResponse),
    );
    isMessageListVisible = toSignal(
        this.store.select(selectSelectedChatIsMessageListVisible),
    );
    isComposeAreaVisible = toSignal(
        this.store.select(selectSelectedChatIsComposeAreaVisible),
    );
    isNotFoundVisible = toSignal(
        this.store.select(selectSelectedChatIsNotFoundVisible),
    );
    isErrorVisible = toSignal(
        this.store.select(selectSelectedChatIsErrorVisible),
    );

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
}
