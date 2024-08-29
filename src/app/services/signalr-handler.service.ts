import { Injectable } from '@angular/core';
import { SignalrService } from './signalr.service';
import {
    IMessageDto,
    ILinkPreviewDto,
    IImagePreviewDto,
    IChatDto,
} from '../api-client/api-client';
import { StoreService } from './store.service';
import { ApiService } from './api.service';
import { BrowserNotificationService } from './browser-notification.service';

@Injectable({
    providedIn: 'root',
})
export class SignalrHandlerService {
    constructor(
        private apiService: ApiService,
        private storeService: StoreService,
        private signalrService: SignalrService,
        private browserNotificationService: BrowserNotificationService,
    ) {}

    async initHandlers(
        handleMessageNotification: (messageDto: IMessageDto) => Promise<void>,
        handleLinkPreviewNotification: (
            linkPreviewDto: ILinkPreviewDto,
        ) => void,
        handleImagePreviewNotification: (
            imagePreviewDto: IImagePreviewDto,
        ) => void,
    ): Promise<void> {
        await this.signalrService.init(
            handleMessageNotification,
            handleLinkPreviewNotification,
            handleImagePreviewNotification,
        );
    }

    removeHandlers() {
        this.signalrService.removeHandlers();
    }

    async handleMessageNotification(
        messageDto: IMessageDto,
        selectedChatId: string,
        chats: readonly IChatDto[],
        isWindowActive: boolean,
    ): Promise<void> {
        this.storeService.setLastMessageInfo(
            messageDto.chatId,
            messageDto.created,
            messageDto.id,
        );
        if (messageDto.chatId === selectedChatId) {
            this.storeService.addMessage(messageDto);
        }

        if (messageDto.isMine) {
            return;
        }

        if (isWindowActive && messageDto.chatId === selectedChatId) {
            await this.apiService.markAsRead(messageDto.chatId, messageDto.id);
        } else {
            const chat = chats.find((chat) => chat.id === messageDto.chatId);
            if (chat) {
                this.storeService.incrementUnreadMessages(messageDto.chatId);
                this.browserNotificationService.showNotification(
                    chat.chatName,
                    messageDto.imageId ? 'Image' : messageDto.text,
                    isWindowActive,
                );
            } else {
                await this.storeService.initChatStorage(true);
            }
        }
    }

    handleLinkPreviewNotification(
        linkPreviewDto: ILinkPreviewDto,
        selectedChatId: string,
    ): void {
        if (linkPreviewDto.chatId !== selectedChatId) {
            return;
        }
        this.storeService.setLinkPreview(linkPreviewDto);
    }

    handleImagePreviewNotification(
        imagePreviewDto: IImagePreviewDto,
        selectedChatId: string,
    ): void {
        if (imagePreviewDto.chatId !== selectedChatId) {
            return;
        }
        this.storeService.setImagePreview(imagePreviewDto);
    }
}
