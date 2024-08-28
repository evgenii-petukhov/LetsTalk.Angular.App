import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListComponent } from './chat-list.component';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { IChatDto } from 'src/app/api-client/api-client';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { ActiveArea } from 'src/app/enums/active-areas';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { ApiService } from 'src/app/services/api.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ChatListItemStubComponent } from '../chat-list-item/chat-list-item.component.stub';

class MockApiService {
    sendMessage() {
        return of({});
    }

    markAsRead() {
        return of({});
    }
}

class MockFileStorageService {
    uploadImageAsBlob() {
        return Promise.resolve({
            getId: () => 'mock-id',
            getWidth: () => 100,
            getHeight: () => 100,
            getImageFormat: () => 1,
            getSignature: () => 'mock-signature',
        });
    }
}

describe('ChatListComponent', () => {
    let component: ChatListComponent;
    let fixture: ComponentFixture<ChatListComponent>;
    let store: MockStore;
    let storeService: StoreService;
    let idGeneratorService: IdGeneratorService;

    const initialState = {
        chats: [] as IChatDto[],
        selectedChatId: 'some-chat-id',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ChatListComponent,
                ChatListItemStubComponent,
                OrderByPipe
            ],
            imports: [
                StoreModule.forRoot({}, { metaReducers: [] }),
            ],
            providers: [
                provideMockStore({ initialState }),
                { provide: ApiService, useClass: MockApiService },
                { provide: FileStorageService, useClass: MockFileStorageService },
                StoreService,
                IdGeneratorService
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        storeService = TestBed.inject(StoreService);
        idGeneratorService = TestBed.inject(IdGeneratorService);

        store.overrideSelector(selectChats, [] as IChatDto[]);
        store.overrideSelector(selectSelectedChatId, initialState.selectedChatId);

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should select chat and call storeService methods on chatSelected', () => {
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        spyOn(storeService, 'setSelectedChatId').and.callThrough();
        spyOn(storeService, 'markAllAsRead').and.callThrough();
        spyOn(storeService, 'setLayoutSettings').and.callThrough();
        spyOn(idGeneratorService, 'isFake').and.returnValue(false);

        component.onChatSelected(chat);

        expect(storeService.setSelectedChatId).toHaveBeenCalledWith(chat.id);
        expect(storeService.markAllAsRead).toHaveBeenCalledWith(chat);
        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({ activeArea: ActiveArea.chat });
    });

    it('should not call markAllAsRead if chat ID is fake', () => {
        const chat: IChatDto = {
            id: 'fake-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        spyOn(storeService, 'setSelectedChatId').and.callThrough();
        spyOn(storeService, 'markAllAsRead').and.callThrough();
        spyOn(storeService, 'setLayoutSettings').and.callThrough();
        spyOn(idGeneratorService, 'isFake').and.returnValue(true);

        component.onChatSelected(chat);

        expect(storeService.setSelectedChatId).toHaveBeenCalledWith(chat.id);
        expect(storeService.markAllAsRead).not.toHaveBeenCalled();
        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({ activeArea: ActiveArea.chat });
    });
});
