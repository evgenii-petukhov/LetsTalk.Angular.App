import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { UnreadCountComponent } from './unread-count/unread-count.component';
import { ChatListItemComponent } from './chat-list-item/chat-list-item.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';

@NgModule({
    declarations: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        LogoutButtonComponent,
    ],
    imports: [CommonModule, SharedModule, FontAwesomeModule, AppRoutingModule],
    exports: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        LogoutButtonComponent,
    ],
})
export class ChatSidebarModule {}
