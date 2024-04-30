import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectSelectedChatId } from 'src/app/state/selected-chat-id/select-selected-chat-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { Subject, takeUntil } from 'rxjs';
import { selectSelectedChat } from 'src/app/state/selected-chat/select-selected-chat.selector';
import { ActiveArea } from 'src/app/enums/active-areas';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
    chats: readonly IChatDto[] = [];
    chats$ = this.store.select(selectChats);
    selectedChatId$ = this.store.select(selectSelectedChatId);
    selectedChat$ = this.store.select(selectSelectedChat);

    private unsubscribe$: Subject<void> = new Subject<void>();
    private selectedChat: IChatDto;

    constructor(
        private store: Store,
        private storeService: StoreService) { }

    ngOnInit(): void {
        this.chats$.pipe(takeUntil(this.unsubscribe$)).subscribe(chats => {
            this.chats = chats;
        });

        this.selectedChat$.pipe(takeUntil(this.unsubscribe$)).subscribe(chat => {
            this.selectedChat = chat;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onChatSelected(chatId: string): void {
        this.storeService.setSelectedChatId(chatId);
        this.storeService.markAllAsRead(this.selectedChat);
        this.storeService.setLayoutSettings({ activeArea: ActiveArea.chat });
    }
}
