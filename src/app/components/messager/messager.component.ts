import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { IAccountDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { selectLayoutSettings } from 'src/app/state/layout-settings/select-layout-settings.selectors';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {
    selectedAccountId$ = this.store.select(selectSelectedAccountId);
    layout$ = this.store.select(selectLayoutSettings);

    private accounts: ReadonlyArray<IAccountDto> = [];
    private selectedAccountId: number;
    private isWindowActive = true;

    constructor(
        private apiService: ApiService,
        private signalrService: SignalrService,
        private notificationService: NotificationService,
        private store: Store,
        private storeService: StoreService
    ) { }

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilityChange(event: Event) {
        this.isWindowActive = !(event.target as any).hidden;
        this.storeService.readAllMessages(this.selectedAccountId);
    }

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe(accounts => {
            this.accounts = accounts;
            this.storeService.initAccounts(accounts);
        });

        this.selectedAccountId$.subscribe(accountId => {
            this.selectedAccountId = accountId;
        });

        this.signalrService.init(messageDto => {
            this.storeService.setLastMessageDate(messageDto.senderId, messageDto.created);
            if ([messageDto.senderId, messageDto.recipientId].indexOf(this.selectedAccountId) > -1) {
                this.storeService.addMessage(messageDto);
            }
            if (this.isWindowActive && (messageDto.senderId === this.selectedAccountId)) {
                this.apiService.markAsRead(messageDto.id).subscribe();
            }
            const sender = this.accounts.find(account => account.id === messageDto.senderId);
            if (sender) {
                this.storeService.incrementUnreadMessages(messageDto.senderId);
                if (messageDto.senderId !== this.selectedAccountId) {
                    this.notificationService.showNotification(
                        `${sender.firstName} ${sender.lastName}`,
                        messageDto.text,
                        this.isWindowActive);
                }
            }
        }, (linkPreviewDto) => {
            if (linkPreviewDto.accountId !== this.selectedAccountId) {
                return;
            }
            this.storeService.setLinkPreview(linkPreviewDto);
        });
    }
}
