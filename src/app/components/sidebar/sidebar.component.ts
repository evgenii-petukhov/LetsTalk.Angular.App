import { Component } from '@angular/core';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { SidebarState } from 'src/app/enums/sidebar-state';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    faCirclePlus = faCirclePlus;
    state = SidebarState.chats;
    sidebarState = SidebarState;

    switchToAcccountList(): void {
        this.state = SidebarState.accounts;
    }
}
