import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { IProfileDto } from 'src/app/api-client/api-client';
import { SidebarState } from 'src/app/enums/sidebar-state';

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

    constructor(private storeService: StoreService) {}

    async ngOnInit(): Promise<void> {
        this.account = await this.storeService.getLoggedInUser();
    }

    onLogoutButtonClicked(): void {
        window.localStorage.clear();
        window.location.reload();
    }

    onBackButtonClicked(): void {
        this.storeService.setLayoutSettings({
            sidebarState: SidebarState.chats,
        });
    }
}
