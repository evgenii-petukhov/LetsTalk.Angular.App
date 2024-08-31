import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ActiveArea } from 'src/app/enums/active-areas';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { selectChats } from 'src/app/state/chats/chats.selector';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
    chats: readonly IChatDto[] = [];
    selectedChatId: string;

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService,
    ) {}

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

    onChatSelected(chat: IChatDto): void {
        this.storeService.setSelectedChatId(chat.id);

        if (!this.idGeneratorService.isFake(chat.id)) {
            this.storeService.markAllAsRead(chat);
        }

        this.storeService.setLayoutSettings({ activeArea: ActiveArea.chat });
    }
}
