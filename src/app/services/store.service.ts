import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto, ILinkPreviewDto, IMessageDto, LinkPreviewDto } from '../api-client/api-client';
import { accountsActions } from '../state/accounts/accounts.actions';
import { ILayoutSettngs } from '../state/layout-settings/layout-settings';
import { layoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { selectedAccountIdActions } from '../state/selected-account-id/selected-account-id.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(private store: Store) { }

    readAllMessages(accountId: number): void {
        setTimeout(() => {
            this.store.dispatch(accountsActions.readall({
                accountId
            }));
        }, 1000);
    }

    initAccounts(accounts: IAccountDto[]): void {
        this.store.dispatch(accountsActions.init({ accounts }));
    }

    initMessages(messageDtos: IMessageDto[]): void {
        this.store.dispatch(messagesActions.init({ messageDtos }));
    }

    addMessage(messageDto: IMessageDto): void {
        this.store.dispatch(messagesActions.add({ messageDto }));
    }

    setLinkPreview(linkPreviewDto: ILinkPreviewDto): void {
        const messageDto = {
            id: linkPreviewDto.messageId,
            linkPreview: new LinkPreviewDto(linkPreviewDto)
        };
        this.store.dispatch(messagesActions.setlinkpreview({messageDto}));
    }

    incrementUnreadMessages(accountId: number): void {
        this.store.dispatch(accountsActions.incrementunread({ accountId }));
    }

    setLastMessageDate(accountId: number, date: number): void {
        this.store.dispatch(accountsActions.setlastmessagedate({ accountId, date }));
    }

    setLayoutSettings(settings: ILayoutSettngs): void {
        this.store.dispatch(layoutSettingsActions.init({ settings }));
    }

    setLoggedInUser(account: IAccountDto): void {
        this.store.dispatch(loggedInUserActions.init({ account }));
    }

    setSelectedAccountId(accountId: number): void {
        this.store.dispatch(selectedAccountIdActions.init({ accountId }));
    }

}
