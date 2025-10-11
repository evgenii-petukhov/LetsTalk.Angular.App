import { Component } from '@angular/core';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrl: './chat-sidebar.component.scss',
    standalone: false,
})
export class ChatSidebarComponent {
    faCirclePlus = faCirclePlus;

    constructor(
        private storeService: StoreService,
    ) {}

    switchToAccountList(): void {
        this.storeService.setLayoutSettings({
            sidebarState: SidebarState.accounts,
        });
    }
}
