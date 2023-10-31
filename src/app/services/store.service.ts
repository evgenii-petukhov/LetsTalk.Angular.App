import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto } from '../api-client/api-client';
import { accountsActions } from '../state/accounts/accounts.actions';
import { ILayoutSettngs } from '../models/layout-settings';
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
import { viewedImageIdActions } from '../state/viewed-image-id/viewed-image-id.actions';
import { Image } from '../models/image';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
        private store: Store,
        private apiService: ApiService,
        private fileStorageService: FileStorageService) {}

    markAllAsRead(account: IAccountDto): void {
        if (account.unreadCount == 0) {
            return;
        }

        this.apiService.markAllAsRead(account.lastMessageId).subscribe(() => {
            setTimeout(() => {
                this.setLastMessageInfo(account.id, account.lastMessageDate, account.lastMessageId);
                this.store.dispatch(accountsActions.setUnreadCount({
                    accountId: account.id,
                    unreadCount: 0
                }));
            }, 1000);
        });
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
            }).unsubscribe();
        });
    }

    initMessages(messageDtos: IMessageDto[]): void {
        this.store.dispatch(messagesActions.init({ messageDtos }));
    }

    addMessages(messageDtos: IMessageDto[]): void {
        this.store.dispatch(messagesActions.addMessages({ messageDtos }));
    }

    addMessage(messageDto: IMessageDto): void {
        this.store.dispatch(messagesActions.addMessage({ messageDto }));
    }

    setLinkPreview(linkPreviewDto: ILinkPreviewDto): void {
        this.store.dispatch(messagesActions.setLinkPreview({ linkPreviewDto }));
    }

    setImagePreview(imagePreviewDto: IImagePreviewDto): void {
        this.store.dispatch(messagesActions.setImagePreview({ imagePreviewDto }));
    }

    incrementUnreadMessages(accountId: number): void {
        this.store.dispatch(accountsActions.incrementUnread({ accountId }));
    }

    setLastMessageInfo(accountId: number, date: number, id: number): void {
        this.store.dispatch(accountsActions.setLastMessageDate({ accountId, date }));
        this.store.dispatch(accountsActions.setLastMessageId({ accountId, id }));
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
            }).unsubscribe();
        });
    }

    setLoggedInUser(account: IAccountDto): void {
        this.store.dispatch(loggedInUserActions.set({ account }));
    }

    setSelectedAccountId(accountId: number): void {
        this.store.dispatch(selectedAccountIdActions.init({ accountId }));
    }

    setViewedImageId(imageId: number): void {
        this.store.dispatch(viewedImageIdActions.init({ imageId }));
    }

    // https://alphahydrae.com/2021/02/how-to-display-an-image-protected-by-header-based-authentication/
    getImageContent(imageId: number): Promise<Image> {
        return new Promise<Image>((resolve, reject) => {
            this.store.select(selectImages).subscribe(images => {
                const image = images?.find(x => x.imageId === imageId);
                if (image) {
                    resolve(image);
                    return;
                }

                this.fileStorageService.download(imageId).then(response => {
                    const content = URL.createObjectURL(new Blob([response.getContent()]));
                    const image = {
                        imageId,
                        content,
                        width: response.getWidth(),
                        height: response.getHeight()
                    };
                    this.store.dispatch(imagesActions.add({
                        image
                    }));
                    resolve(image);
                }).catch(() => reject());
            }).unsubscribe();
        });
    }
}
