import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { Subject, takeUntil } from 'rxjs';
import { MessageListStatus } from 'src/app/models/message-list-status';
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

    private _isCallInProgress = false;
    private _messageListStatus = MessageListStatus.Unknown;
    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);

    get isCallInProgress(): boolean {
        return this._isCallInProgress;
    }

    set isCallInProgress(value: boolean) {
        this._isCallInProgress = value;
        this.updateElementsVisibilityForStatus();
    }

    get messageListStatus(): MessageListStatus {
        return this._messageListStatus;
    }

    set messageListStatus(value: MessageListStatus) {
        this._messageListStatus = value;
        this.updateElementsVisibilityForStatus();
    }

    async ngOnInit(): Promise<void> {
        this.store
            .select(selectSelectedChatId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async () => {
                this.messageListStatus = MessageListStatus.Unknown;
            });

        this.store
            .select(selectVideoCall)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (state) => {
                this.isCallInProgress = state !== null;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onStatusChanged(status: MessageListStatus): void {
        this.messageListStatus = status;
    }

    private updateElementsVisibilityForStatus(): void {
        if (this.isCallInProgress) {
            this.isMessageListVisible =
                this.isComposeAreaVisible =
                this.isNotFoundVisible =
                this.isErrorVisible =
                    false;
        } else {
            this.isMessageListVisible = [
                MessageListStatus.Unknown,
                MessageListStatus.Success,
            ].includes(this.messageListStatus);
            this.isComposeAreaVisible =
                this.messageListStatus === MessageListStatus.Success;
            this.isNotFoundVisible =
                this.messageListStatus === MessageListStatus.NotFound;
            this.isErrorVisible =
                this.messageListStatus === MessageListStatus.Error;
        }
    }
}
