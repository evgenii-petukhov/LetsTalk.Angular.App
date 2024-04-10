import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IChatDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto, IProfileDto } from '../api-client/api-client';
import { chatsActions } from '../state/chats/chats.actions';
import { ILayoutSettngs } from '../models/layout-settings';
import { layoutSettingsActions } from '../state/layout-settings/layout-settings.actions';
import { loggedInUserActions } from '../state/logged-in-user/logged-in-user.actions';
import { messagesActions } from '../state/messages/messages.actions';
import { selectedChatIdActions } from '../state/selected-chat-id/selected-chat-id.actions';
import { selectLoggedInUser } from '../state/logged-in-user/logged-in-user.selectors';
import { ApiService } from './api.service';
import { selectChats } from '../state/chats/chats.selector';
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

    markAllAsRead(chat: IChatDto): void {
        if (!chat || chat.unreadCount === 0) {
            return;
        }

        this.apiService.markAsRead(chat.id, chat.lastMessageId).subscribe(() => {
            setTimeout(() => {
                this.setLastMessageInfo(chat.id, chat.lastMessageDate, chat.lastMessageId);
                this.store.dispatch(chatsActions.setUnreadCount({
                    chatId: chat.id,
                    unreadCount: 0
                }));
            }, 1000);
        });
    }

    getChats(): Promise<readonly IChatDto[]> {
        return new Promise<readonly IChatDto[]>(resolve => {
            this.store.select(selectChats).subscribe(chats => {
                if (chats) {
                    resolve(chats);
                    return;
                }
                this.apiService.getChats().subscribe(response => {
                    this.store.dispatch(chatsActions.init({ chats: response }));
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

    incrementUnreadMessages(chatId: string): void {
        this.store.dispatch(chatsActions.incrementUnread({ chatId }));
    }

    setLastMessageInfo(chatId: string, date: number, id: string): void {
        this.store.dispatch(chatsActions.setLastMessageDate({ chatId, date }));
        this.store.dispatch(chatsActions.setLastMessageId({ chatId, id }));
    }

    setLayoutSettings(settings: ILayoutSettngs): void {
        this.store.dispatch(layoutSettingsActions.init({ settings }));
    }

    getLoggedInUser(): Promise<IProfileDto> {
        return new Promise<IProfileDto>(resolve => {
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
