import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectImageButtonComponent } from './select-image-button/select-image-button.component';
import { SendMessageButtonComponent } from './send-message-button/send-message-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SendMessageComponent } from './send-message/send-message.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        SelectImageButtonComponent,
        SendMessageButtonComponent,
        SendMessageComponent,
    ],
    imports: [CommonModule, FontAwesomeModule, FormsModule],
    exports: [
        SelectImageButtonComponent,
        SendMessageButtonComponent,
        SendMessageComponent,
    ],
})
export class ChatModule {}
