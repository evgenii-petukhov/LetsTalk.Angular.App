import { Component, inject, Input, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { IChatDto } from 'src/app/api-client/api-client';
import { BackButtonStatus } from 'src/app/models/back-button-status';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss'],
    standalone: false,
})
export class ChatHeaderComponent {
    faPhone = faPhone;
    @Input() backButton: BackButtonStatus;

    private readonly store = inject(Store);
    private readonly storeService = inject(StoreService);
    private readonly idGeneratorService = inject(IdGeneratorService);
    private readonly apiService = inject(ApiService);
    private readonly router = inject(Router);

    chat = toSignal(this.store.select(selectSelectedChat), { initialValue: null });

    async onCallClicked(): Promise<void> {
        const chat = this.chat();
        if (!chat) return;

        let chatId: string;
        if (this.shouldCreateIndividualChat(chat)) {
            chatId = await this.handleIndividualChatCreation(
                chat.id,
                chat.accountIds[0],
            );
        }

        this.storeService.initOutgoingCall(chatId ?? chat.id);
    }

    private shouldCreateIndividualChat(chat: IChatDto): boolean {
        return chat.isIndividual && this.idGeneratorService.isFake(chat.id);
    }

    private async handleIndividualChatCreation(
        chatId: string,
        accountId: string,
    ): Promise<string> {
        const chatDto = await this.apiService.createIndividualChat(accountId);
        this.storeService.updateChatId(chatId, chatDto.id);
        await this.router.navigate(['/messenger/chat', chatDto.id]);
        return chatDto.id;
    }
}
