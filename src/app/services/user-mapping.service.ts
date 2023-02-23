import { Injectable } from '@angular/core';
import { faVk, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { User as UserApiModel } from '../models/api/user';
import { User as UserRenderingModel } from '../models/rendering/user';
import { AccountTypeMappingService } from './account-type.service';

@Injectable({
    providedIn: 'root'
})
export class UserMappingService {
    constructor(
        private accountTypeMappingService: AccountTypeMappingService
    ) {}

    faVk = faVk;

    faFacebook = faFacebook;

    public map(input: UserApiModel): UserRenderingModel {
        const output = new UserRenderingModel();
        output.firstname = input.firstname;
        output.lastname = input.lastname;
        output.loginname = input.loginname;
        output.icon = this.accountTypeMappingService.map(input.accounttypeId);

        return output;
    }
}
