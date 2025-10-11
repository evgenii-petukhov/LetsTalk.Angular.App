import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnreadCountComponent } from './unread-count/unread-count.component';
import { SharedModule } from '../shared/shared.module';
import { ChatListItemComponent } from './chat-list-item/chat-list-item.component';
import { ChatListComponent } from './chat-list/chat-list.component';

@NgModule({
    declarations: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
    ],
    imports: [CommonModule, SharedModule],
    exports: [UnreadCountComponent, ChatListItemComponent, ChatListComponent],
})
export class SidebarModule {}
