import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChatDto, IChatDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto, IProfileDto } from '../api-client/api-client';
import { chatsActions } from '../state/chats/chats.actions';
import { ILayoutSettngs } from '../models/layout-settings';
import { layoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { selectedChatIdActions } from '../state/selected-chat/selected-chat-id.actions';
import { selectLoggedInUser } from '../state/logged-in-user/logged-in-user.selectors';
import { ApiService } from './api.service';
import { selectChats } from '../state/chats/chats.selector';
import { imagesActions } from '../state/images/images.actions';
import { selectImages } from '../state/images/images.selector';
import { FileStorageService } from './file-storage.service';
import { viewedImageIdActions } from '../state/viewed-image-id/viewed-image-id.actions';
import { Image } from '../models/image';
import { selectAccounts } from '../state/accounts/accounts.selector';
import { accountsActions } from '../state/accounts/accounts.actions';
import { take } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
        private store: Store,
        private apiService: ApiService,
        private fileStorageService: FileStorageService) { }

    markAllAsRead(chat: IChatDto): void {
        if (!chat || chat.unreadCount === 0) {
            return;
        }

        this.apiService.markAsRead(chat.id, chat.lastMessageId).pipe(take(1)).subscribe(() => {
            setTimeout(() => {
                this.setLastMessageInfo(chat.id, chat.lastMessageDate, chat.lastMessageId);
                this.store.dispatch(chatsActions.setUnreadCount({
                    chatId: chat.id,
                    unreadCount: 0
                }));
            }, 1000);
        });
    }

    initChatStorage(force?: boolean): void {
        if (force) {
            this.apiService.getChats().pipe(take(1)).subscribe(response => {
                this.store.dispatch(chatsActions.init({ chats: response }));
            });
        } else {
            this.store.select(selectChats).pipe(take(1)).subscribe(chats => {
                if (!chats) {
                    this.apiService.getChats().pipe(take(1)).subscribe(response => {
                        this.store.dispatch(chatsActions.init({ chats: response }));
                    });
                }
            });
        }
    }

    initAccountStorage(): void {
        this.store.select(selectAccounts).pipe(take(1)).subscribe(accounts => {
            if (!accounts) {
                this.apiService.getAccounts().pipe(take(1)).subscribe(response => {
                    this.store.dispatch(accountsActions.init({ accounts: response }));
                });
            }
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

    incrementUnreadMessages(chatId: string): void {
        this.store.dispatch(chatsActions.incrementUnread({ chatId }));
    }

    setLastMessageInfo(chatId: string, date: number, id: string): void {
        this.store.dispatch(chatsActions.setLastMessageDate({ chatId, date }));
        this.store.dispatch(chatsActions.setLastMessageId({ chatId, id }));
    }

    updateChatId(chatId: string, newChatId: string): void {
        this.store.dispatch(chatsActions.updateChatId({ chatId, newChatId }));
    }

    addChat(chatDto: ChatDto): void {
        this.store.dispatch(chatsActions.add({ chatDto }));
    }

    setLayoutSettings(settings: ILayoutSettngs): void {
        this.store.dispatch(layoutSettingsActions.init({ settings }));
    }

    getLoggedInUser(): Promise<IProfileDto> {
        return new Promise<IProfileDto>((resolve, reject) => {
            this.store.select(selectLoggedInUser).pipe(take(1)).subscribe(account => {
                if (account) {
                    resolve(account);
                    return;
                }

                this.apiService.getProfile().pipe(take(1)).subscribe({
                    next: response => {
                        this.store.dispatch(loggedInUserActions.init({ account: response }));
                        resolve(response);
                    },
                    error: e => reject(e)
                });
            });
        });
    }

    setLoggedInUser(account: IProfileDto): void {
        this.store.dispatch(loggedInUserActions.set({ account }));
    }

    setSelectedChatId(chatId: string): void {
        this.store.dispatch(selectedChatIdActions.init({ chatId }));
    }

    setViewedImageId(imageId: string): void {
        this.store.dispatch(viewedImageIdActions.init({ imageId }));
    }

    // https://alphahydrae.com/2021/02/how-to-display-an-image-protected-by-header-based-authentication/
    getImageContent(imageId: string): Promise<Image> {
        return new Promise<Image>((resolve, reject) => {
            this.store.select(selectImages).pipe(take(1)).subscribe(async images => {
                const image = images?.find(x => x.imageId === imageId);
                if (image) {
                    resolve(image);
                    return;
                }

                try {
                    const response = await this.fileStorageService.download(imageId);
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
                }
                catch {
                    reject();
                }
            });
        });
    }
}
