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
import { imagesActions } from '../state/images/images.actions';
import { selectImages } from '../state/images/images.selector';
import { FileStorageService } from './file-storage.service';
import { Base64Service } from './base64.service';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
        private store: Store,
        private apiService: ApiService,
        private fileStorageService: FileStorageService,
        private base64Service: Base64Service) { }

    readAllMessages(accountId: number): void {
        setTimeout(() => {
            this.store.dispatch(accountsActions.readAll({
                accountId
            }));
        }, 1000);
    }

    getAccounts(): Promise<readonly IAccountDto[]> {
        return new Promise<readonly IAccountDto[]>(resolve => {
            this.store.select(selectAccounts).subscribe(accounts => {
                if (accounts) {
                    resolve(accounts);
                    return;
                }
                this.apiService.getAccounts().subscribe(response => {
                    this.store.dispatch(accountsActions.init({ accounts: response }));
                    resolve(response);
                });
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
        this.store.dispatch(messagesActions.setLinkPreview({linkPreviewDto}));
    }

    incrementUnreadMessages(accountId: number): void {
        this.store.dispatch(accountsActions.incrementUnread({ accountId }));
    }

    setLastMessageDate(accountId: number, date: number): void {
        this.store.dispatch(accountsActions.setLastMessageDate({ accountId, date }));
    }

    setLayoutSettings(settings: ILayoutSettngs): void {
        this.store.dispatch(layoutSettingsActions.init({ settings }));
    }

    getLoggedInUser(): Promise<IAccountDto> {
        return new Promise<IAccountDto>(resolve => {
            this.store.select(selectLoggedInUser).subscribe(account => {
                if (account) {
                    resolve(account);
                    return;
                }

                this.apiService.getProfile().subscribe(response => {
                    this.store.dispatch(loggedInUserActions.init({ account: response }));
                    resolve(response);
                });
            });
        });
    }

    setLoggedInUser(account: IAccountDto): void {
        this.store.dispatch(loggedInUserActions.set({ account }));
    }

    setSelectedAccountId(accountId: number): void {
        this.store.dispatch(selectedAccountIdActions.init({ accountId }));
    }

    // https://alphahydrae.com/2021/02/how-to-display-an-image-protected-by-header-based-authentication/
    getImage(imageId: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.store.select(selectImages).subscribe(images => {
                const image = images?.find(x => x.imageId === imageId);
                if (image) {
                    resolve(image.content);
                    return;
                }

                this.fileStorageService.download(imageId).then(response => {
                    const content = URL.createObjectURL(new Blob([response.getContent()]));
                    this.store.dispatch(imagesActions.add({ image: {
                        imageId,
                        content
                    } }));
                    resolve(content);
                }).catch(() => reject());
            });
        });
    }
}
