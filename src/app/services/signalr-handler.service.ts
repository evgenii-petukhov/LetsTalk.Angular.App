import { inject, Injectable } from '@angular/core';
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
import { RtcSessionSettings } from '../models/RtcSessionSettings';

@Injectable({
    providedIn: 'root',
})
export class SignalrHandlerService {
    private readonly apiService = inject(ApiService);
    private readonly storeService = inject(StoreService);
    private readonly signalrService = inject(SignalrService);
    private readonly browserNotificationService = inject(BrowserNotificationService);

    async initHandlers(
        handleMessageNotification: (messageDto: IMessageDto) => Promise<void>,
        handleLinkPreviewNotification: (
            linkPreviewDto: ILinkPreviewDto,
        ) => void,
        handleImagePreviewNotification: (
            imagePreviewDto: IImagePreviewDto,
        ) => void,
        handleRtcSessionOfferNotification: (
            sessionSettings: RtcSessionSettings,
        ) => void,
        handleRtcSessionAnswerNotification: (
            sessionSettings: RtcSessionSettings,
        ) => void,
    ): Promise<void> {
        await this.browserNotificationService.init();
        await this.signalrService.init(
            handleMessageNotification,
            handleLinkPreviewNotification,
            handleImagePreviewNotification,
            handleRtcSessionOfferNotification,
            handleRtcSessionAnswerNotification,
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
                    messageDto.image ? 'Image' : messageDto.text,
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
