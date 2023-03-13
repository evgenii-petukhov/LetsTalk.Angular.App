import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { IAccountDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { selectLayoutSettings } from 'src/app/state/layout-settings/select-layout-settings.selectors';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { MappingService } from 'src/app/services/mapping-service';

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
        private storeService: StoreService,
        private mappingService: MappingService
    ) { }

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe(accounts => {
            this.accounts = accounts;
            this.storeService.initAccounts(accounts);
        });

        this.selectedAccountId$.subscribe(accountId => {
            this.selectedAccountId = accountId;
        });

        this.signalrService.init(messageDto => {
            if (messageDto.accountId === this.selectedAccountId) {
                messageDto.isMine = false;
                const message = this.mappingService.mapMessage(messageDto);
                this.storeService.addMessage(message);
                this.storeService.setLastMessageDate(message.accountId, message.created);
            }
            if (this.isWindowActive && (messageDto.accountId === this.selectedAccountId)) {
                this.apiService.markAsRead(messageDto.id).subscribe();
            } else {
                const sender = this.accounts.find(account => account.id === messageDto.accountId);
                if (sender) {
                    this.storeService.incrementUnreadMessages(messageDto.accountId);
                    this.notificationService.showNotification(
                        `${sender.firstName} ${sender.lastName}`, 
                        messageDto.text, 
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
