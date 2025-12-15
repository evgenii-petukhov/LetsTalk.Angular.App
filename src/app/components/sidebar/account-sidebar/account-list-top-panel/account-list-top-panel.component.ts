import { Component, HostBinding, inject, Input, OnInit } from '@angular/core';
import { IProfileDto } from 'src/app/api-client/api-client';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-account-list-top-panel',
    templateUrl: './account-list-top-panel.component.html',
    styleUrl: './account-list-top-panel.component.scss',
    standalone: false,
})
export class AccountListTopPanelComponent implements OnInit {
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
