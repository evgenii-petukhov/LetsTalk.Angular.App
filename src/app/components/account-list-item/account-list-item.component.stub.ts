import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IAccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list-item',
    template: '',
})
export class AccountListItemStubComponent {
    @Input() account!: IAccountDto;
    @Output() accountSelected = new EventEmitter<IAccountDto>();
}
