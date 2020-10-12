import { Injectable } from '@angular/core';
import { AccountTypes } from '../constants/accounttypes';
import { Chat as ChatApiModel } from '../models/api/chat';
import { Chat as ChatRenderingModel } from '../models/rendering/chat';
import { User as UserRenderingModel } from '../models/rendering/user';
import { faVk, faFacebook } from '@fortawesome/free-brands-svg-icons';

@Injectable({
  providedIn: 'root',
})
export class ChatMappingService {
  constructor() {}

  faVk = faVk;

  faFacebook = faFacebook;

  public map(input: ChatApiModel): ChatRenderingModel {
    const output = new ChatRenderingModel();
    output.user = new UserRenderingModel();
    output.user.id = input.user.id;
    output.user.firstname = input.user.firstname;
    output.user.lastname = input.user.lastname;
    switch (+input.user.accounttype_id) {
      case AccountTypes.FACEBOOK:
        output.user.icon = faFacebook;
        break;

      case AccountTypes.VK:
        output.user.icon = faVk;
        break;
    }

    return output;
  }
}
