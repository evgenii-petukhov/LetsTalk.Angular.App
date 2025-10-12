import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { SharedModule } from '../../shared/shared.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountSidebarNavigationPanelComponent } from './account-sidebar-navigation-panel/account-sidebar-navigation-panel.component';

@NgModule({
    declarations: [
        AccountListItemComponent,
        AccountListComponent,
        AccountSidebarNavigationPanelComponent,
    ],
    imports: [CommonModule, SharedModule],
    exports: [
        AccountListItemComponent,
        AccountListComponent,
        AccountSidebarNavigationPanelComponent,
    ],
})
export class AccountSidebarModule {}
