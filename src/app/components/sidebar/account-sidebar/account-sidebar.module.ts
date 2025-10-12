import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { SharedModule } from '../../shared/shared.module';
import { AccountListComponent } from './account-list/account-list.component';

@NgModule({
    declarations: [AccountListItemComponent, AccountListComponent],
    imports: [CommonModule, SharedModule],
    exports: [AccountListItemComponent, AccountListComponent],
})
export class AccountSidebarModule {}
