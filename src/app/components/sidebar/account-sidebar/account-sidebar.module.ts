import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [AccountListItemComponent],
    imports: [CommonModule, SharedModule],
    exports: [AccountListItemComponent],
})
export class AccountSidebarModule {}
