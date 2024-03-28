import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { IAccountDto, IImagePreviewDto, ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { selectLayoutSettings } from 'src/app/state/layout-settings/select-layout-settings.selectors';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { Subject, takeUntil } from 'rxjs';
import { selectViededImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
import { selectSelectedAccount } from 'src/app/state/selected-account/select-selected-account.selector';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
    selectedAccountId$ = this.store.select(selectSelectedAccountId);
    selectedAccount$ = this.store.select(selectSelectedAccount);
    selectedViewedImageId$ = this.store.select(selectViededImageId);
    layout$ = this.store.select(selectLayoutSettings);

    private accounts: readonly IAccountDto[] = [];
    private selectedAccountId: string;
    private selectedAccount: IAccountDto;
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
        this.storeService.markAllAsRead(this.selectedAccount);
    }

    async ngOnInit(): Promise<void> {
        this.storeService.getAccounts().then(accounts => {
            this.accounts = accounts;
        });

        this.selectedAccountId$.pipe(takeUntil(this.unsubscribe$)).subscribe(accountId => {
            this.selectedAccountId = accountId;
        });

        this.selectedAccount$.pipe(takeUntil(this.unsubscribe$)).subscribe(account => {
            this.selectedAccount = account;
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
        if ([messageDto.senderId, messageDto.recipientId].indexOf(this.selectedAccountId) > -1) {
            this.storeService.addMessage(messageDto);
        }
        if (this.isWindowActive && (messageDto.senderId === this.selectedAccountId)) {
            this.apiService.markAsRead(messageDto.id).pipe(takeUntil(this.unsubscribe$)).subscribe();
        } else {
            const sender = this.accounts.find(account => account.id === messageDto.senderId);
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
        if (linkPreviewDto.accountId !== this.selectedAccountId) {
            return;
        }
        this.storeService.setLinkPreview(linkPreviewDto);
    }

    handleImagePreviewNotification(imagePreviewDto: IImagePreviewDto): void {
        if (imagePreviewDto.accountId !== this.selectedAccountId) {
            return;
        }
        this.storeService.setImagePreview(imagePreviewDto);
    }
}
