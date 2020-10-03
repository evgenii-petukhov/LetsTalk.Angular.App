import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Chat } from '../../models/rendering/chat';
import { faVk, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { AccountTypes } from '../../constants/accounttypes';

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
        output.id = x.id;
        output.name = x.name;
        switch (+x.accounttype) {
          case AccountTypes.FACEBOOK:
            output.icon = faFacebook;
            break;

          case AccountTypes.VK:
            output.icon = faVk;
            break;
        }

        return output;
      });
    });
  }
}
