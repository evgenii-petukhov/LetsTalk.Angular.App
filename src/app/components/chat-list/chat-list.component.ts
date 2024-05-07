import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { Subject } from 'rxjs';
import { ActiveArea } from 'src/app/enums/active-areas';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { selectChats } from 'src/app/state/chats/chats.selector';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnDestroy {
    chats$ = this.store.select(selectChats);
    selectedChatId$ = this.store.select(selectSelectedChatId);

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService) { }

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
