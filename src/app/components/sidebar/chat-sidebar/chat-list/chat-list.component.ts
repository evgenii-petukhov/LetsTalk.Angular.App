import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { selectChats } from 'src/app/state/chats/chats.selector';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss'],
    standalone: false,
})
export class ChatListComponent implements OnInit, OnDestroy {
    chats: readonly IChatDto[] = [];
    selectedChatId: string;

    private readonly store = inject(Store);
    private readonly unsubscribe$: Subject<void> = new Subject<void>();

    ngOnInit(): void {
        combineLatest([
            this.store.select(selectChats),
            this.store.select(selectSelectedChatId),
        ])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([chats, selectedChatId]) => {
                this.chats = chats;
                this.selectedChatId = selectedChatId;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
