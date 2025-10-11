import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnreadCountComponent } from './unread-count/unread-count.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [UnreadCountComponent],
    imports: [CommonModule, SharedModule],
    exports: [UnreadCountComponent],
})
export class SidebarModule {}
