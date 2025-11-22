import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
    IChatDto,
    IImageDto,
    IImagePreviewDto,
    ILinkPreviewDto,
    IMessageDto,
} from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { StoreService } from 'src/app/services/store.service';
import { combineLatest, filter, map, startWith, Subject, takeUntil } from 'rxjs';
import { selectViewedImageKey } from 'src/app/state/viewed-image-key/viewed-image-key.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { SignalrHandlerService } from 'src/app/services/signalr-handler.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IdGeneratorService } from 'src/app/services/id-generator.service';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss'],
    standalone: false,
})
export class MessengerComponent implements OnInit, OnDestroy {
    selectedChatId$ = this.store.select(selectSelectedChatId);
    viewedImageKey: IImageDto;
    isSidebarShown = true;
    selectedChatId: string;

    private chats: readonly IChatDto[] = [];
    private selectedChat: IChatDto;
    private isWindowActive = true;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
        private signalrHandlerService: SignalrHandlerService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private idGeneratorService: IdGeneratorService,
    ) {}

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilityChange(event: Event): void {
        this.isWindowActive = !(event.target as Document).hidden;
        this.storeService.markAllAsRead(this.selectedChat);
    }

    async ngOnInit(): Promise<void> {
        await this.storeService.initChatStorage();

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => this.activatedRoute.firstChild?.snapshot.params || {}),
            takeUntil(this.unsubscribe$)
        ).subscribe(params => {
            const chatId = params['id'];
            this.isSidebarShown = !chatId;
            this.storeService.setSelectedChatId(chatId);

            if (this.chats && !this.idGeneratorService.isFake(chatId)) {
                this.storeService.markAllAsRead(this.chats.find(c => c.id === chatId));
            }
        });

        combineLatest([
            this.store.select(selectChats),
            this.store.select(selectSelectedChat),
            this.store.select(selectViewedImageKey),
        ])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([chats, chat, imageKey]) => {
                this.chats = chats;
                this.selectedChat = chat;
                this.viewedImageKey = imageKey;
            });

        await this.signalrHandlerService.initHandlers(
            this.handleMessageNotification.bind(this),
            this.handleLinkPreviewNotification.bind(this),
            this.handleImagePreviewNotification.bind(this),
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.signalrHandlerService.removeHandlers();
    }

    handleMessageNotification(dto: IMessageDto): void {
        this.signalrHandlerService.handleMessageNotification(
            dto,
            this.selectedChat?.id,
            this.chats,
            this.isWindowActive,
        );
    }

    handleLinkPreviewNotification(dto: ILinkPreviewDto): void {
        this.signalrHandlerService.handleLinkPreviewNotification(
            dto,
            this.selectedChat?.id,
        );
    }

    handleImagePreviewNotification(dto: IImagePreviewDto): void {
        this.signalrHandlerService.handleImagePreviewNotification(
            dto,
            this.selectedChat?.id,
        );
    }
}
