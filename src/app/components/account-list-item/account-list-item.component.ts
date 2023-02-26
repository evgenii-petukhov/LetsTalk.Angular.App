import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from 'src/app/models/rendering/account';

@Component({
    selector: 'app-account-list-item',
    templateUrl: './account-list-item.component.html',
    styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent{
    @Input() account: Account;
    @Output() onAccountSelectedCallback = new EventEmitter<number>();

    onAccountSelected(): boolean {
        this.onAccountSelectedCallback.emit(this.account.id);
        return false;
    }
}
