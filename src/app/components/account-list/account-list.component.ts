import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatDto, IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { Store } from '@ngrx/store';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts$ = this.store.select(selectAccounts);

    private unsubscribe$: Subject<void> = new Subject<void>();
    private chats: readonly IChatDto[] = [];

    constructor(
        private store: Store,
        private storeService: StoreService,
        private idGeneratorService: IdGeneratorService) { }

    ngOnInit(): void {
        this.storeService.initAccountStorage();

        this.store.select(selectChats).pipe(takeUntil(this.unsubscribe$)).subscribe(chats => {
            this.chats = chats;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(account: IAccountDto): void {
        const chat = this.chats.find(chat => chat.isIndividual && chat.accountIds[0] === account.id);
        if (chat) {
            this.storeService.setSelectedChatId(chat.id);
            this.storeService.markAllAsRead(chat);
        } else {
            const chatDto = new ChatDto();
            chatDto.id = this.idGeneratorService.getNextFakeId().toString();
            chatDto.isIndividual = true;
            chatDto.accountIds = [account.id];
            chatDto.accountTypeId = account.accountTypeId;
            chatDto.chatName = `${account.firstName} ${account.lastName}`;
            chatDto.imageId = account.imageId;
            chatDto.photoUrl = account.photoUrl;
            chatDto.unreadCount = 0;

            this.storeService.addChat(chatDto);
            this.storeService.setSelectedChatId(chatDto.id);
        }
        this.storeService.setLayoutSettings({ sidebarState: SidebarState.chats });
    }
}
