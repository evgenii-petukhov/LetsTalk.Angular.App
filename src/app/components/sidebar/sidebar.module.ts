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
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { AccountListComponent } from './account-list/account-list.component';

@NgModule({
    declarations: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        ChatSidebarComponent,
        LoggedInUserComponent,
        LogoutButtonComponent,
        AccountListItemComponent,
        AccountListComponent,
    ],
    imports: [CommonModule, SharedModule, FontAwesomeModule, AppRoutingModule],
    exports: [
        UnreadCountComponent,
        ChatListItemComponent,
        ChatListComponent,
        ChatSidebarComponent,
        LoggedInUserComponent,
        LogoutButtonComponent,
        AccountListItemComponent,
        AccountListComponent,
    ],
})
export class SidebarModule {}
