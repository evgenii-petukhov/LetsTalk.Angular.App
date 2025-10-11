import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnreadCountComponent } from './unread-count/unread-count.component';
import { SharedModule } from '../shared/shared.module';
import { ChatListItemComponent } from './chat-list-item/chat-list-item.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { LoggedInUserComponent } from './logged-in-user/logged-in-user.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';

@NgModule({
    declarations: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        ChatSidebarComponent,
        LoggedInUserComponent,
        LogoutButtonComponent,
    ],
    imports: [CommonModule, SharedModule, FontAwesomeModule, AppRoutingModule],
    exports: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        ChatSidebarComponent,
        LoggedInUserComponent,
        LogoutButtonComponent,
    ],
})
export class SidebarModule {}
