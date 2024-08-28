import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { IChatDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';
import { StoreService } from 'src/app/services/store.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { selectViewedImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { ActiveArea } from 'src/app/enums/active-areas';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { SignalrHandlerService } from 'src/app/services/signalr-handler.service';

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
        private store: Store,
        private storeService: StoreService,
        private signalrHandlerService: SignalrHandlerService,
    ) { }

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilityChange(event: Event): void {
        this.isWindowActive = !(event.target as Document).hidden;
        this.storeService.markAllAsRead(this.selectedChat);
    }

    async ngOnInit(): Promise<void> {
        await this.storeService.initChatStorage();

        combineLatest([
            this.store.select(selectChats),
            this.store.select(selectSelectedChat),
            this.store.select(selectLayoutSettings)
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(([chats, chat, layout]) => {
            this.chats = chats;
            this.selectedChat = chat;
            this.isSidebarShown = layout.activeArea === ActiveArea.sidebar;
            this.isChatShown = layout.activeArea === ActiveArea.chat;
        });

        await this.signalrHandlerService.initHandlers(
            this.handleMessageNotification.bind(this),
            this.handleLinkPreviewNotification.bind(this),
            this.handleImagePreviewNotification.bind(this));
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.signalrHandlerService.removeHandlers();
    }

    handleMessageNotification(dto: IMessageDto): void {
        this.signalrHandlerService.handleMessageNotification(dto, this.selectedChat?.id, this.chats, this.isWindowActive);
    }

    handleLinkPreviewNotification(dto: ILinkPreviewDto): void {
        this.signalrHandlerService.handleLinkPreviewNotification(dto, this.selectedChat?.id);
    }

    handleImagePreviewNotification(dto: IImagePreviewDto): void {
        this.signalrHandlerService.handleImagePreviewNotification(dto, this.selectedChat?.id);
    }
}
