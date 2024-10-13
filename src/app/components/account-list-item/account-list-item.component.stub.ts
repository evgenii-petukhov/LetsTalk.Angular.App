import { Component, Input } from '@angular/core';
import { IAccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list-item',
    template: '<div></div>',
})
export class AccountListItemStubComponent {
    @Input() account!: IAccountDto;
}
