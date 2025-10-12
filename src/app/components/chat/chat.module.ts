import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectImageButtonComponent } from './select-image-button/select-image-button.component';
import { SendMessageButtonComponent } from './send-message-button/send-message-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SendMessageComponent } from './send-message/send-message.component';
import { FormsModule } from '@angular/forms';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { SharedModule } from '../shared/shared.module';
import { MessageComponent } from './message/message.component';
import { ImageComponent } from './image/image.component';

@NgModule({
    declarations: [
        SelectImageButtonComponent,
        SendMessageButtonComponent,
        SendMessageComponent,
        ChatHeaderComponent,
        MessageComponent,
        ImageComponent,
    ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        FormsModule,
        SharedModule,
    ],
    exports: [
        SelectImageButtonComponent,
        SendMessageButtonComponent,
        SendMessageComponent,
        ChatHeaderComponent,
        MessageComponent,
        ImageComponent,
    ],
})
export class ChatModule {}
