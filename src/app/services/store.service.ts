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
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
        private store: Store,
        private apiService: ApiService,
        private fileStorageService: FileStorageService) { }

    async markAllAsRead(chat: IChatDto): Promise<void> {
        if (!chat || chat.unreadCount === 0) {
            return;
        }

        await this.apiService.markAsRead(chat.id, chat.lastMessageId);
        
        this.setLastMessageInfo(chat.id, chat.lastMessageDate, chat.lastMessageId);
        this.store.dispatch(chatsActions.setUnreadCount({
            chatId: chat.id,
            unreadCount: 0
        }));
    }

    async initChatStorage(force?: boolean): Promise<void> {
        if (force) {
            const response = await this.apiService.getChats();
            this.store.dispatch(chatsActions.init({ chats: response }));
        } else {
            const chats = await firstValueFrom(this.store.select(selectChats));
            if (!chats) {
                const response = await this.apiService.getChats();
                this.store.dispatch(chatsActions.init({ chats: response }));
            }
        }
    }

    async initAccountStorage(): Promise<void> {
        const accounts = await firstValueFrom(this.store.select(selectAccounts));
        if (!accounts) {
            const response = await this.apiService.getAccounts();
            this.store.dispatch(accountsActions.init({ accounts: response }));
        }
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

    async getLoggedInUser(): Promise<IProfileDto> {
        const account = await firstValueFrom(this.store.select(selectLoggedInUser));
        if (account) {
            return account;
        }

        const response = await this.apiService.getProfile();
        this.store.dispatch(loggedInUserActions.init({ account: response }));
        return response;
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
    async getImageContent(imageId: string): Promise<Image> {
        const images = await firstValueFrom(this.store.select(selectImages));
        let image = images?.find(x => x.imageId === imageId);
        if (image) {
            return image;
        }

        const response = await this.fileStorageService.download(imageId);
        const content = URL.createObjectURL(new Blob([response.getContent()]));
        image = {
            imageId,
            content,
            width: response.getWidth(),
            height: response.getHeight()
        };
        this.store.dispatch(imagesActions.add({
            image
        }));
        return image;
    }
}
