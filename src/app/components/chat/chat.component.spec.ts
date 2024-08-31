import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    tick,
} from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { ApiService } from '../../services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ChatHeaderStubComponent } from '../chat-header/chat-header.component.stub';
import { MessageStubComponent } from '../message/message.component.stub';
import { SendMessageStubComponent } from '../send-message/send-message.component.stub';
import { VisibleOnlyPipe } from 'src/app/pipes/visibleOnly';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { Message } from 'src/app/models/message';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { By } from '@angular/platform-browser';
import { IMessageDto } from 'src/app/api-client/api-client';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let mockSelectSelectedChatId: MemoizedSelector<
        object,
        string,
        DefaultProjectorFn<string>
    >;
    let mockSelectMessages: MemoizedSelector<
        object,
        readonly Message[],
        DefaultProjectorFn<readonly Message[]>
    >;

    beforeEach(async () => {
        apiService = jasmine.createSpyObj('ApiService', ['getMessages']);
        storeService = jasmine.createSpyObj('StoreService', [
            'initMessages',
            'addMessages',
            'setLastMessageInfo',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                ChatComponent,
                ChatHeaderStubComponent,
                MessageStubComponent,
                SendMessageStubComponent,
                VisibleOnlyPipe,
            ],
            providers: [
                provideMockStore({}),
                { provide: ApiService, useValue: apiService },
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectMessages = store.overrideSelector(selectMessages, null);
        mockSelectSelectedChatId = store.overrideSelector(
            selectSelectedChatId,
            null,
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not render any messages when chatId is real and message list is empty', fakeAsync(() => {
        // Arrange
        const chatId = 'chatId';
        const messageDtos = [];
        mockSelectSelectedChatId.setResult(chatId);
        mockSelectMessages.setResult(messageDtos);
        apiService.getMessages.and.resolveTo(messageDtos);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).toHaveBeenCalledOnceWith(chatId, 0);
        expect(storeService.addMessages).toHaveBeenCalledOnceWith(messageDtos);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
            chatId,
            0,
            '',
        );
        const messages = fixture.debugElement.queryAll(
            By.directive(MessageStubComponent),
        );
        expect(messages.length).toBe(0);
        flush();
    }));

    it('should render messages when chatId is real and message list is not empty', fakeAsync(async () => {
        // Arrange
        const chatId = 'chatId';
        const messageDtos: IMessageDto[] = [
            {
                chatId: chatId,
                id: 'message1',
                text: 'Hi',
                textHtml: '<p>Hi</p>',
                created: 1725020117,
            },
            {
                chatId: chatId,
                id: 'message2',
                text: 'Bye',
                textHtml: '<p>Bye</p>',
                created: 1725113717,
            },
        ];
        mockSelectSelectedChatId.setResult(chatId);
        mockSelectMessages.setResult([]);
        apiService.getMessages.and.resolveTo(messageDtos);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).toHaveBeenCalledOnceWith(chatId, 0);
        expect(storeService.addMessages).toHaveBeenCalledOnceWith(messageDtos);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
            chatId,
            1725113717,
            'message2',
        );

        // Act
        const messages = messageDtos.map((message) => new Message(message));
        mockSelectMessages.setResult(messages);
        store.refreshState();
        fixture.detectChanges();

        // Assert
        const messageElements = fixture.debugElement
            .queryAll(By.directive(MessageStubComponent))
            .map((element) => element.componentInstance);
        expect(messageElements.length).toBe(2);
        expect(messageElements[0].message).toBe(messages[0]);
        expect(messageElements[1].message).toBe(messages[1]);

        // Act
        await component.onScroll();
        expect(apiService.getMessages).toHaveBeenCalledWith(chatId, 1);
        expect(storeService.addMessages).toHaveBeenCalledTimes(2);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledTimes(1);

        flush();
    }));

    it('should not render any messages when chatId is fake', fakeAsync(() => {
        // Arrange
        const chatId = '-1';
        mockSelectSelectedChatId.setResult(chatId);
        idGeneratorService.isFake.and.returnValue(true);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).not.toHaveBeenCalled();
        expect(storeService.addMessages).not.toHaveBeenCalled();
        expect(storeService.setLastMessageInfo).not.toHaveBeenCalled();
        flush();
    }));
});
