import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { IChatDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { Subject, take, takeUntil } from 'rxjs';
import { selectViewedImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { ActiveArea } from 'src/app/enums/active-areas';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectChats } from 'src/app/state/chats/chats.selector';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
    selectedChatId$ = this.store.select(selectSelectedChatId);
    selectedViewedImageId$ = this.store.select(selectViewedImageId);
    isSidebarShown = true;
    isChatShown = false;
    selectedChatId: string;

    private chats: readonly IChatDto[] = [];
    private selectedChat: IChatDto;
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
        this.storeService.initChatStorage();

        this.store.select(selectChats).pipe(takeUntil(this.unsubscribe$)).subscribe(chats => {
            this.chats = chats;
        });

        this.store.select(selectSelectedChat).pipe(takeUntil(this.unsubscribe$)).subscribe(chat => {
            this.selectedChat = chat;
        });

        this.store.select(selectLayoutSettings).pipe(takeUntil(this.unsubscribe$)).subscribe(layout => {
            this.isSidebarShown = layout.activeArea === ActiveArea.sidebar;
            this.isChatShown = layout.activeArea === ActiveArea.chat;
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
        this.storeService.setLastMessageInfo(messageDto.chatId, messageDto.created, messageDto.id);
        if (messageDto.chatId === this.selectedChat?.id) {
            this.storeService.addMessage(messageDto);
        }

        if (messageDto.isMine) {
            return;
        }

        if (this.isWindowActive && (messageDto.chatId === this.selectedChat?.id)) {
            this.apiService.markAsRead(messageDto.chatId, messageDto.id).pipe(take(1)).subscribe();
        } else {
            const chat = this.chats.find(chat => chat.id === messageDto.chatId);
            if (chat) {
                this.storeService.incrementUnreadMessages(messageDto.chatId);
                this.notificationService.showNotification(
                    `${chat.chatName}`,
                    messageDto.imageId ? 'Image' : messageDto.text,
                    this.isWindowActive);
            }
        }
    }

    handleLinkPreviewNotification(linkPreviewDto: ILinkPreviewDto): void {
        if (linkPreviewDto.chatId !== this.selectedChat?.id) {
            return;
        }
        this.storeService.setLinkPreview(linkPreviewDto);
    }

    handleImagePreviewNotification(imagePreviewDto: IImagePreviewDto): void {
        if (imagePreviewDto.chatId !== this.selectedChat?.id) {
            return;
        }
        this.storeService.setImagePreview(imagePreviewDto);
    }
}
