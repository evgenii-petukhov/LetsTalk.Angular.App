import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatDto, IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { Subject } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { IdGeneratorService } from 'src/app/services/id-generator.service';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts: readonly IAccountDto[] = [];

    private unsubscribe$: Subject<void> = new Subject<void>();
    private chats: readonly IChatDto[] = [];

    constructor(
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService) { }

    ngOnInit(): void {
        this.storeService.getChats().then(chats => {
            this.chats = chats;
        });

        this.storeService.getAccounts().then(accounts => {
            this.accounts = accounts;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(account: IAccountDto): void {
        const chat = this.chats.find(chat => chat.isIndividual && chat.accountId === account.id);
        if (chat) {
            this.storeService.setSelectedChatId(chat.id);
            this.storeService.markAllAsRead(chat);
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
