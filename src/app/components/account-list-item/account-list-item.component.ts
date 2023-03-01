import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list-item',
    templateUrl: './account-list-item.component.html',
    styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent{
    @Input() account: AccountDto;
    @Output() onAccountSelectedCallback = new EventEmitter<number>();

    onAccountSelected(): boolean {
        this.onAccountSelectedCallback.emit(this.account.id);
        return false;
    }
}
