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

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe(accounts => {
            this.accounts = accounts;
            this.storeService.initAccounts(accounts);
        });

        this.selectedAccountId$.subscribe(accountId => {
            this.selectedAccountId = accountId;
        });

        this.signalrService.init(message => {
            if (message.accountId === this.selectedAccountId) {
                message.isMine = false;
                this.storeService.addMessage(message);
                this.storeService.setLastMessageDate(message.accountId, message.created);
            }
            if (this.isWindowActive && (message.accountId === this.selectedAccountId)) {
                this.apiService.markAsRead(message.id).subscribe();
            } else {
                const sender = this.accounts.find(account => account.id === message.accountId);
                if (sender) {
                    this.storeService.incrementUnreadMessages(message.accountId);
                    this.notificationService.showNotification(
                        `${sender.firstName} ${sender.lastName}`, 
                        message.text, 
                        this.isWindowActive);
                }
            }
        });
    }

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilityChange(event: Event) {
        this.isWindowActive = !(event.target as any).hidden;
        this.storeService.readAllMessages(this.selectedAccountId);
    }
}
