import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnreadCountComponent } from './chat-sidebar/unread-count/unread-count.component';
import { SharedModule } from '../shared/shared.module';
import { ChatListItemComponent } from './chat-sidebar/chat-list-item/chat-list-item.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { LoggedInUserComponent } from './logged-in-user/logged-in-user.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountSidebarNavigationPanelComponent } from './account-sidebar-navigation-panel/account-sidebar-navigation-panel.component';
import { AccountSidebarComponent } from './account-sidebar/account-sidebar.component';
import { SidebarComponent } from './sidebar.component';
import { ChatSidebarModule } from './chat-sidebar/chat-sidebar.module';

@NgModule({
    declarations: [
        ChatListComponent,
        ChatSidebarComponent,
        LoggedInUserComponent,
        LogoutButtonComponent,
        AccountListItemComponent,
        AccountListComponent,
        AccountSidebarNavigationPanelComponent,
        AccountSidebarComponent,
        SidebarComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FontAwesomeModule,
        AppRoutingModule,
        ChatSidebarModule,
    ],
    exports: [SidebarComponent],
})
export class SidebarModule {}
