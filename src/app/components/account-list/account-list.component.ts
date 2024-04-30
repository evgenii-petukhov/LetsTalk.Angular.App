import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { StoreService } from 'src/app/services/store.service';
import { selectSelectedChat } from 'src/app/state/selected-chat/select-selected-chat.selector';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { ActiveArea } from 'src/app/enums/active-areas';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts: readonly IAccountDto[] = [];
    accounts$ = this.store.select(selectAccounts);
    chats: readonly IChatDto[] = [];
    chats$ = this.store.select(selectChats);
    selectedChat$ = this.store.select(selectSelectedChat);

    private unsubscribe$: Subject<void> = new Subject<void>();
    private selectedChat: IChatDto;

    constructor(
        private store: Store,
        private storeService: StoreService) { }

    ngOnInit(): void {
        this.accounts$.pipe(takeUntil(this.unsubscribe$)).subscribe(accounts => {
            this.accounts = accounts;
        });

        this.chats$.pipe(takeUntil(this.unsubscribe$)).subscribe(chats => {
            this.chats = chats;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(accountId: string): void {
        const chatId = this.chats.find(chat => chat.isIndividual && chat.accountId === accountId)?.id;
        if (chatId) {
            this.storeService.setSelectedChatId(chatId);
            this.storeService.markAllAsRead(this.selectedChat);
            this.storeService.setLayoutSettings({ activeArea: ActiveArea.chat });
        }
        this.storeService.setLayoutSettings({ sidebarState: SidebarState.chats });
    }
}
