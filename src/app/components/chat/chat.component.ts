import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from 'src/app/models/message-list-status';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectVideoCall } from 'src/app/state/video-call/video-call.selectors';

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
    private messageListStatusSubject = new BehaviorSubject<MessageListStatus>(
        MessageListStatus.Unknown,
    );
    messageListStatus$ = this.messageListStatusSubject.asObservable();

    ngOnInit(): void {
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.messageListStatusSubject.next(MessageListStatus.Unknown);
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isCallInProgress$ = combineLatest([
        this.store.select(selectSelectedChatId),
        this.store.select(selectVideoCall),
    ]).pipe(
        map(([chatId, state]) => state !== null && state.chatId === chatId),
        takeUntil(this.unsubscribe$),
    );

    isMessageListVisible$ = combineLatest([
        this.isCallInProgress$,
        this.messageListStatus$,
    ]).pipe(
        map(
            ([isCallInProgress, status]) =>
                !isCallInProgress &&
                [MessageListStatus.Unknown, MessageListStatus.Success].includes(
                    status,
                ),
        ),
        takeUntil(this.unsubscribe$),
    );

    isComposeAreaVisible$ = combineLatest([
        this.isCallInProgress$,
        this.messageListStatus$,
    ]).pipe(
        map(
            ([isCallInProgress, status]) =>
                !isCallInProgress && status === MessageListStatus.Success,
        ),
        takeUntil(this.unsubscribe$),
    );

    isNotFoundVisible$ = combineLatest([
        this.isCallInProgress$,
        this.messageListStatus$,
    ]).pipe(
        map(
            ([isCallInProgress, status]) =>
                !isCallInProgress && status === MessageListStatus.NotFound,
        ),
        takeUntil(this.unsubscribe$),
    );

    isErrorVisible$ = combineLatest([
        this.isCallInProgress$,
        this.messageListStatus$,
    ]).pipe(
        map(
            ([isCallInProgress, status]) =>
                !isCallInProgress && status === MessageListStatus.Error,
        ),
        takeUntil(this.unsubscribe$),
    );

    onStatusChanged(status: MessageListStatus): void {
        this.messageListStatusSubject.next(status);
    }
}
