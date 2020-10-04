import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { faVk, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { AccountTypes } from '../../constants/accounttypes';
import { Chat } from '../../models/rendering/chat';
import { User } from '../../models/rendering/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chats: Chat[];

  faVk = faVk;

  faFacebook = faFacebook;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getChats().subscribe((data) => {
      this.chats = data.map((x) => {
        const output = new Chat();
        output.user = new User();
        output.user.id = x.user.id;
        output.user.firstname = x.user.firstname;
        output.user.lastname = x.user.lastname;
        switch (+x.user.accounttype_id) {
          case AccountTypes.FACEBOOK:
            output.user.icon = faFacebook;
            break;

          case AccountTypes.VK:
            output.user.icon = faVk;
            break;
        }

        return output;
      });
    });
  }
}
