import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountSidebarNavigationPanelComponent } from './account-sidebar-navigation-panel/account-sidebar-navigation-panel.component';
import { AccountSidebarComponent } from './account-sidebar/account-sidebar.component';
import { SidebarComponent } from './sidebar.component';
import { ChatSidebarModule } from './chat-sidebar/chat-sidebar.module';
import { AccountSidebarModule } from './account-sidebar/account-sidebar.module';

@NgModule({
    declarations: [
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
        AccountSidebarModule,
    ],
    exports: [SidebarComponent],
})
export class SidebarModule {}
