import { Injectable } from '@angular/core';
import { Account as AccountRenderingModel } from '../models/rendering/account';
import { AccountTypeMappingService } from './account-type.service';
import { AccountDto } from '../api-client/api-client';

@Injectable({
    providedIn: 'root'
})
export class AccountMappingService {
    constructor(
        private accountTypeMappingService: AccountTypeMappingService
    ) {}

    map(input: AccountDto): AccountRenderingModel {
        const output = new AccountRenderingModel();
        output.id = input.id;
        output.firstname = input.firstName;
        output.lastname = input.lastName;
        output.pictureUrl = input.photoUrl;
        output.icon = this.accountTypeMappingService.map(input.accountTypeId);

        return output;
    }
}
