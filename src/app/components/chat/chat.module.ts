import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectImageButtonComponent } from './select-image-button/select-image-button.component';
import { SendButtonComponent } from './send-button/send-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ComposeAreaComponent } from './compose-area/compose-area.component';
import { FormsModule } from '@angular/forms';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { SharedModule } from '../shared/shared.module';
import { MessageComponent } from './message/message.component';
import { ImageComponent } from './image/image.component';
import { ChatComponent } from './chat.component';
import { VisibleOnlyPipe } from 'src/app/pipes/visibleOnly';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AutoResizeTextAreaComponent } from './auto-resize-text-area/auto-resize-text-area.component';
import { MessageListComponent } from './message-list/message-list.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { VideoCallComponent } from './video-call/video-call.component';

@NgModule({
    declarations: [
        SelectImageButtonComponent,
        SendButtonComponent,
        ComposeAreaComponent,
        ChatHeaderComponent,
        MessageComponent,
        ImageComponent,
        ChatComponent,
        VideoCallComponent,
        AutoResizeTextAreaComponent,
        MessageListComponent,
        NotFoundComponent,
        ErrorComponent,
        VisibleOnlyPipe,
    ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        FormsModule,
        SharedModule,
        AppRoutingModule,
    ],
    exports: [
        ChatComponent,
    ],
})
export class ChatModule {}
