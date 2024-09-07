import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { IProfileDto } from 'src/app/api-client/api-client';
import { SidebarState } from 'src/app/enums/sidebar-state';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss'],
})
export class LoggedInUserComponent implements OnInit {
    account: IProfileDto;
    @Input()
    @HostBinding('class.navigation-active')
    isNavigationActive: boolean = false;

    constructor(private storeService: StoreService) {}

    async ngOnInit(): Promise<void> {
        this.account = await this.storeService.getLoggedInUser();
    }

    onLogoutButtonClicked(): boolean {
        window.localStorage.clear();
        window.location.reload();
        return false;
    }

    onBackButtonClicked(): boolean {
        this.storeService.setLayoutSettings({
            sidebarState: SidebarState.chats,
        });
        return false;
    }
}
