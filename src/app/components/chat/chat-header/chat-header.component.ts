import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { IChatDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { BackButtonStatus } from 'src/app/models/back-button-status';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';
import { VideoCallType } from 'src/app/models/video-call-type';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss'],
    standalone: false,
})
export class ChatHeaderComponent implements OnInit, OnDestroy {
    chat: IChatDto;
    faPhone = faPhone;
    @Input() backButton: BackButtonStatus;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly store = inject(Store);
    private readonly storeService = inject(StoreService);
    private readonly idGeneratorService = inject(IdGeneratorService);
    private readonly apiService = inject(ApiService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.store
            .select(selectSelectedChat)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((chat) => {
                this.chat = chat;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async onCallClicked(): Promise<void> {
        let chatId: string;
        if (this.shouldCreateIndividualChat(this.chat)) {
            chatId = await this.handleIndividualChatCreation(
                this.chat.id,
                this.chat.accountIds[0],
            );
        }

        this.storeService.initOutgoingCall(chatId ?? this.chat.id);
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
