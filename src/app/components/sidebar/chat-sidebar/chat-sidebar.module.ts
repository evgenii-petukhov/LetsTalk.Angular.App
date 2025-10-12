import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { UnreadCountComponent } from './unread-count/unread-count.component';
import { ChatListItemComponent } from './chat-list-item/chat-list-item.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { LoggedInUserComponent } from './logged-in-user/logged-in-user.component';
import { ChatSidebarComponent } from './chat-sidebar.component';

@NgModule({
    declarations: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        LogoutButtonComponent,
        LoggedInUserComponent,
        ChatSidebarComponent,
    ],
    imports: [CommonModule, SharedModule, FontAwesomeModule, AppRoutingModule],
    exports: [
        ChatSidebarComponent,
    ],
})
export class ChatSidebarModule {}
