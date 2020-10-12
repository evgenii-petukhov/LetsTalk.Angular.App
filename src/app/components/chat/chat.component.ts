import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Chat } from '../../models/rendering/chat';
import { ChatMappingService } from '../../services/chat-mapping.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chats: Chat[];

  constructor(
    private apiService: ApiService,
    private chatMappingService: ChatMappingService
  ) {}

  ngOnInit(): void {
    this.apiService.getChats().subscribe((data) => {
      this.chats = data.map(this.chatMappingService.map);
    });
  }
}
