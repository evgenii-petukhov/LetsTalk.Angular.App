import { Component, HostBinding, inject, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { IProfileDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-list-top-panel',
    templateUrl: './chat-list-top-panel.component.html',
    styleUrls: ['./chat-list-top-panel.component.scss'],
    standalone: false,
})
export class ChatListTopPanelComponent implements OnInit {
    account: IProfileDto;
    @Input()
    @HostBinding('class.navigation-active')
    isNavigationActive: boolean = false;

    private readonly storeService = inject(StoreService);

    async ngOnInit(): Promise<void> {
        this.account = await this.storeService.getLoggedInUser();
    }

    onLogoutButtonClicked(): void {
        window.localStorage.clear();
        window.location.reload();
    }
}
