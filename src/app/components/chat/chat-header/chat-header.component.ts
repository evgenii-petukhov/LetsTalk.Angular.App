import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { StoreService } from 'src/app/services/store.service';
import { ActiveArea } from 'src/app/enums/active-areas';
import { IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss'],
    standalone: false,
})
export class ChatHeaderComponent implements OnInit, OnDestroy {
    chat: IChatDto;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
    ) {}

    ngOnInit(): void {
        this.store
            .select(selectSelectedChat)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((chat) => {
                this.chat = chat;
            });
    }

    onBackClicked(): void {
        this.storeService.setLayoutSettings({ activeArea: ActiveArea.sidebar });
        this.storeService.setSelectedChatId(null);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
