import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { IAccountDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectSelectedChatId } from 'src/app/state/selected-chat-id/select-selected-chat-id.selectors';
import { selectLayoutSettings } from 'src/app/state/layout-settings/select-layout-settings.selectors';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { Subject, takeUntil } from 'rxjs';
import { selectViededImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/select-selected-chat.selector';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
    selectedChatId$ = this.store.select(selectSelectedChatId);
    selectedChat$ = this.store.select(selectSelectedChat);
    selectedViewedImageId$ = this.store.select(selectViededImageId);
    layout$ = this.store.select(selectLayoutSettings);

    private chats: readonly IAccountDto[] = [];
    private selectedChatId: string;
    private selectedChat: IAccountDto;
    private isWindowActive = true;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private apiService: ApiService,
        private signalrService: SignalrService,
        private notificationService: NotificationService,
        private store: Store,
        private storeService: StoreService
    ) { }

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilityChange(event: Event): void {
        this.isWindowActive = !(event.target as Document).hidden;
        this.storeService.markAllAsRead(this.selectedChat);
    }

    async ngOnInit(): Promise<void> {
        this.storeService.getChats().then(chats => {
            this.chats = chats;
        });

        this.selectedChatId$.pipe(takeUntil(this.unsubscribe$)).subscribe(chatId => {
            this.selectedChatId = chatId;
        });

        this.selectedChat$.pipe(takeUntil(this.unsubscribe$)).subscribe(chat => {
            this.selectedChat = chat;
        });

        await this.signalrService.init(
            this.handleMessageNotification.bind(this),
            this.handleLinkPreviewNotification.bind(this),
            this.handleImagePreviewNotification.bind(this));
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.signalrService.removeHandlers();
    }

    handleMessageNotification(messageDto: IMessageDto): void {
        this.storeService.setLastMessageInfo(messageDto.senderId, messageDto.created, messageDto.id);
        if ([messageDto.senderId, messageDto.recipientId].indexOf(this.selectedChatId) > -1) {
            this.storeService.addMessage(messageDto);
        }
        if (this.isWindowActive && (messageDto.senderId === this.selectedChatId)) {
            this.apiService.markAsRead(messageDto.id).pipe(takeUntil(this.unsubscribe$)).subscribe();
        } else {
            const sender = this.chats.find(chat => chat.id === messageDto.senderId);
            if (sender) {
                this.storeService.incrementUnreadMessages(messageDto.senderId);
                this.notificationService.showNotification(
                    `${sender.chatName}`,
                    messageDto.imageId ? 'Image' : messageDto.text,
                    this.isWindowActive);
            }
        }
    }

    handleLinkPreviewNotification(linkPreviewDto: ILinkPreviewDto): void {
        if (linkPreviewDto.accountId !== this.selectedChatId) {
            return;
        }
        this.storeService.setLinkPreview(linkPreviewDto);
    }

    handleImagePreviewNotification(imagePreviewDto: IImagePreviewDto): void {
        if (imagePreviewDto.accountId !== this.selectedChatId) {
            return;
        }
        this.storeService.setImagePreview(imagePreviewDto);
    }
}
