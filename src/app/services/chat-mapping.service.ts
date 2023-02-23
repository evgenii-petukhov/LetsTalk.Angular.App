import { Injectable } from '@angular/core';
import { Chat as ChatApiModel } from '../models/api/chat';
import { Chat as ChatRenderingModel } from '../models/rendering/chat';
import { User as UserRenderingModel } from '../models/rendering/user';
import { AccountTypeMappingService } from './account-type.service';

@Injectable({
    providedIn: 'root'
})
export class ChatMappingService {
    constructor(
        private accountTypeMappingService: AccountTypeMappingService
    ) {}

    map(input: ChatApiModel): ChatRenderingModel {
        const output = new ChatRenderingModel();
        output.user = new UserRenderingModel();
        output.user.id = input.user.id;
        output.user.firstname = input.user.firstname;
        output.user.lastname = input.user.lastname;
        output.user.pictureUrl = input.user.pictureUrl;
        output.user.icon = this.accountTypeMappingService.map(input.user.accounttypeId);

        return output;
    }
}
