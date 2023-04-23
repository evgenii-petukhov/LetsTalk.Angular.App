import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto, ILinkPreviewDto, IMessageDto } from '../api-client/api-client';
import { accountsActions } from '../state/accounts/accounts.actions';
import { ILayoutSettngs } from '../state/layout-settings/layout-settings';
import { layoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { selectedAccountIdActions } from '../state/selected-account-id/selected-account-id.actions';
import { selectLoggedInUser } from '../state/logged-in-user/logged-in-user.selectors';
import { ApiService } from './api.service';
import { selectAccounts } from '../state/accounts/accounts.selector';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
        private store: Store,
        private apiService: ApiService) { }

    readAllMessages(accountId: number): void {
        setTimeout(() => {
            this.store.dispatch(accountsActions.readall({
                accountId
            }));
        }, 1000);
    }

    loadAccounts(): Promise<readonly IAccountDto[]> {
        return new Promise<readonly IAccountDto[]>(resolve => {
            this.store.select(selectAccounts).subscribe(accounts => {
                if (accounts) {
                    resolve(accounts);
                } else {
                    this.apiService.getAccounts().subscribe(response => {
                        this.store.dispatch(accountsActions.init({ accounts: response }));
                        resolve(response);
                    });
                }
            });
        });
    }

    initMessages(messageDtos: IMessageDto[]): void {
        this.store.dispatch(messagesActions.init({ messageDtos }));
    }

    addMessage(messageDto: IMessageDto): void {
        this.store.dispatch(messagesActions.add({ messageDto }));
    }

    setLinkPreview(linkPreviewDto: ILinkPreviewDto): void {
        this.store.dispatch(messagesActions.setlinkpreview({linkPreviewDto}));
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

    loadLoggedInUser(): Promise<IAccountDto> {
        return new Promise<IAccountDto>(resolve => {
            this.store.select(selectLoggedInUser).subscribe(account => {
                if (account) {
                    resolve(account);
                } else {
                    this.apiService.getMe().subscribe(response => {
                        this.store.dispatch(loggedInUserActions.init({ account: response }));
                        resolve(response);
                    });
                }
            });
        });
    }

    setLoggedInUser(account: IAccountDto): void {
        this.store.dispatch(loggedInUserActions.set({ account }));
    }

    setSelectedAccountId(accountId: number): void {
        this.store.dispatch(selectedAccountIdActions.init({ accountId }));
    }

}
