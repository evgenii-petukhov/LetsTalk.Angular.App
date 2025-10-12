import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectImageButtonComponent } from './select-image-button/select-image-button.component';
import { SendMessageButtonComponent } from './send-message-button/send-message-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [SelectImageButtonComponent, SendMessageButtonComponent],
    imports: [CommonModule, FontAwesomeModule],
    exports: [SelectImageButtonComponent, SendMessageButtonComponent],
})
export class ChatModule {}
