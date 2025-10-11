import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { UnreadCountComponent } from './unread-count/unread-count.component';

@NgModule({
    declarations: [UnreadCountComponent],
    imports: [CommonModule, SharedModule, FontAwesomeModule, AppRoutingModule],
    exports: [UnreadCountComponent],
})
export class ChatSidebarModule {}
