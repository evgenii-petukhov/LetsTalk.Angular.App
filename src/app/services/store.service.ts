import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto, IMessageDto } from '../api-client/api-client';
import { AccountsActions } from '../state/accounts/accounts.actions';
import { ILayoutSettngs } from '../state/layout-settings/layout-settings';
import { LayoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { LoggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { MessagesActions } from '../state/messages/messages.actions';
import { SelectedAccountIdActions } from '../state/selected-account-id/selected-account-id.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(private store: Store) { }

    readAllMessages(accountId: number): void {
        setTimeout(() => {
            this.store.dispatch(AccountsActions.readall({
                accountId: accountId
            }));
        }, 1000);
    }

    initAccounts(accounts: IAccountDto[]): void {
        this.store.dispatch(AccountsActions.init({ accounts }));
    }

    initMessages(messages: IMessageDto[]): void {
        this.store.dispatch(MessagesActions.init({ messages }));
    }

    addMessage(message: IMessageDto): void {
        this.store.dispatch(MessagesActions.add({ message }));
    }

    incrementUnreadMessages(accountId: number): void {
        this.store.dispatch(AccountsActions.increment({ accountId }));
    }

    setLayoutSettings(settings: ILayoutSettngs): void {
        this.store.dispatch(LayoutSettingsActions.init({ settings }));
    }

    setLoggedInUser(account: IAccountDto):void {
        this.store.dispatch(LoggedInUserActions.init({ account }));
    }
    
    setSelectedAccountId(accountId: number): void {
        this.store.dispatch(SelectedAccountIdActions.init({ accountId }));
    }
    
}
