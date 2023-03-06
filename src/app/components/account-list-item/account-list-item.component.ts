import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list-item',
    templateUrl: './account-list-item.component.html',
    styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent{
    @Input() account: IAccountDto;
    @Output() onAccountSelectedCallback = new EventEmitter<number>();

    onAccountSelected(): boolean {
        this.onAccountSelectedCallback.emit(this.account.id);
        return false;
    }
}
