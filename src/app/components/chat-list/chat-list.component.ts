import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectSelectedChatId } from 'src/app/state/selected-chat/select-selected-chat-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { Subject } from 'rxjs';
import { ActiveArea } from 'src/app/enums/active-areas';
import { IdGeneratorService } from 'src/app/services/id-generator.service';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
    chats: readonly IChatDto[] = [];
    selectedChatId$ = this.store.select(selectSelectedChatId);

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService) { }

    ngOnInit(): void {
        this.storeService.getChats().then(chats => {
            this.chats = chats;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onChatSelected(chat: IChatDto): void {
        this.storeService.setSelectedChatId(chat.id);

        if (!this.idGeneratorService.isFake(chat.id)) {
            this.storeService.markAllAsRead(chat);
        }

        this.storeService.setLayoutSettings({ activeArea: ActiveArea.chat });
    }
}
