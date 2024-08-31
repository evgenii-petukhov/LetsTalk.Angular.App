import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListComponent } from './chat-list.component';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { ActiveArea } from 'src/app/enums/active-areas';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { ChatListItemStubComponent } from '../chat-list-item/chat-list-item.component.stub';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { By } from '@angular/platform-browser';
import { AccountListItemStubComponent } from '../account-list-item/account-list-item.component.stub';

describe('ChatListComponent', () => {
    let component: ChatListComponent;
    let fixture: ComponentFixture<ChatListComponent>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let mockSelectSelectedChatId: MemoizedSelector<
        object,
        string,
        DefaultProjectorFn<string>
    >;
    let mockSelectChats: MemoizedSelector<
        object,
        readonly IChatDto[],
        DefaultProjectorFn<readonly IChatDto[]>
    >;

    const account1: IAccountDto = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        accountTypeId: 1,
        imageId: 'img1',
    };

    const account2: IAccountDto = {
        id: '2',
        firstName: 'Neil',
        lastName: 'Johnston',
        accountTypeId: 1,
        photoUrl: 'url2',
    };

    const account3: IAccountDto = {
        id: '3',
        firstName: 'Rick',
        lastName: 'Barry',
        accountTypeId: 1,
        imageId: 'img3',
    };

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'setSelectedChatId',
            'markAllAsRead',
            'setLayoutSettings',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                ChatListComponent,
                ChatListItemStubComponent,
                OrderByPipe,
            ],
            providers: [
                provideMockStore({}),
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectChats = store.overrideSelector(selectChats, null);
        mockSelectSelectedChatId = store.overrideSelector(
            selectSelectedChatId,
            null,
        );
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should output ChatListItemComponent instances sorted by chatName', () => {
        // Arrange
        const chat1: IChatDto = {
            chatName: 'Neil Johnston',
        };

        const chat2: IChatDto = {
            chatName: 'Bob Pettit',
        };

        const chat3: IChatDto = {
            chatName: 'Rick Barry',
        };

        const chat4: IChatDto = {
            chatName: 'George Gevin',
        };

        mockSelectChats.setResult([chat1, chat2, chat3, chat4]);

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        const chatListItems = fixture.debugElement
            .queryAll(By.directive(ChatListItemStubComponent))
            .map((element) => element.componentInstance);

        expect(chatListItems.length).toBe(4);
        expect(chatListItems[0].chat).toBe(chat2);
        expect(chatListItems[1].chat).toBe(chat4);
        expect(chatListItems[2].chat).toBe(chat1);
        expect(chatListItems[3].chat).toBe(chat3);
    });

    it('should output ChatListItemComponent sorted by unreadCount (desc) then by chatName', () => {
        // Arrange
        const chat1: IChatDto = {
            chatName: 'Neil Johnston',
            unreadCount: 7,
        };

        const chat2: IChatDto = {
            chatName: 'Bob Pettit',
            unreadCount: 3,
        };

        const chat3: IChatDto = {
            chatName: 'Rick Barry',
            unreadCount: 10,
        };

        const chat4: IChatDto = {
            chatName: 'George Gevin',
            unreadCount: 6,
        };

        mockSelectChats.setResult([chat1, chat2, chat3, chat4]);

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        const chatListItems = fixture.debugElement
            .queryAll(By.directive(ChatListItemStubComponent))
            .map((element) => element.componentInstance);

        expect(chatListItems.length).toBe(4);
        expect(chatListItems[0].chat).toBe(chat3);
        expect(chatListItems[1].chat).toBe(chat1);
        expect(chatListItems[2].chat).toBe(chat4);
        expect(chatListItems[3].chat).toBe(chat2);
    });

    it('should output  ChatListItemComponent sorted by lastMessageDate (desc) then by chatName', () => {
        // Arrange
        const chat1: IChatDto = {
            chatName: 'Neil Johnston',
            lastMessageDate: 1725039342,
        };

        const chat2: IChatDto = {
            chatName: 'Bob Pettit',
            lastMessageDate: 1724866542,
        };

        const chat3: IChatDto = {
            chatName: 'Rick Barry',
            lastMessageDate: 1724952942,
        };

        const chat4: IChatDto = {
            chatName: 'George Gevin',
            lastMessageDate: 1725132982,
        };

        mockSelectChats.setResult([chat1, chat2, chat3, chat4]);

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        const chatListItems = fixture.debugElement
            .queryAll(By.directive(ChatListItemStubComponent))
            .map((element) => element.componentInstance);

        expect(chatListItems.length).toBe(4);
        expect(chatListItems[0].chat).toBe(chat4);
        expect(chatListItems[1].chat).toBe(chat1);
        expect(chatListItems[2].chat).toBe(chat3);
        expect(chatListItems[3].chat).toBe(chat2);
    });

    it('should select chat and call storeService methods on chatSelected', () => {
        // Arrange
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        idGeneratorService.isFake.and.returnValue(false);

        // Act
        component.onChatSelected(chat);

        // Assert
        expect(storeService.setSelectedChatId).toHaveBeenCalledOnceWith(
            chat.id,
        );
        expect(storeService.markAllAsRead).toHaveBeenCalledOnceWith(chat);
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            activeArea: ActiveArea.chat,
        });
    });

    it('should not call markAllAsRead if chat ID is fake', () => {
        // Arrange
        const chat: IChatDto = {
            id: '-1',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        idGeneratorService.isFake.and.returnValue(true);

        // Act
        component.onChatSelected(chat);

        // Assert
        expect(storeService.setSelectedChatId).toHaveBeenCalledOnceWith(
            chat.id,
        );
        expect(storeService.markAllAsRead).not.toHaveBeenCalled();
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            activeArea: ActiveArea.chat,
        });
    });
});
