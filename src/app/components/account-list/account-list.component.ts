import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChatDto, IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { StoreService } from 'src/app/services/store.service';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { IdGeneratorService } from 'src/app/services/id-generator.service';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts$ = this.store.select(selectAccounts);

    private unsubscribe$: Subject<void> = new Subject<void>();
    private selectedChat: IChatDto;
    private chats: readonly IChatDto[] = [];

    constructor(
        private store: Store,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService) { }

    ngOnInit(): void {
        this.store.select(selectChats).pipe(takeUntil(this.unsubscribe$)).subscribe(chats => {
            this.chats = chats;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(account: IAccountDto): void {
        const chatId = this.chats.find(chat => chat.isIndividual && chat.accountId === account.id)?.id;
        if (chatId) {
            this.storeService.setSelectedChatId(chatId);
            this.storeService.markAllAsRead(this.selectedChat);
        } else {
            const chatDto = new ChatDto();
            chatDto.id = this.idGeneratorService.getNextFakeId().toString();
            chatDto.accountId = account.id;
            chatDto.accountTypeId = account.accountTypeId;
            chatDto.chatName = `${account.firstName} ${account.lastName}`;
            chatDto.imageId = account.imageId;
            chatDto.isIndividual = true;
            chatDto.photoUrl = account.photoUrl;
            chatDto.unreadCount = 0;

            this.storeService.addChat(chatDto);
            this.storeService.setSelectedChatId(chatDto.id);
        }
        this.storeService.setLayoutSettings({ sidebarState: SidebarState.chats });
    }
}
