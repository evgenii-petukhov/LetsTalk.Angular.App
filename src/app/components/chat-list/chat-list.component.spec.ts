import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListComponent } from './chat-list.component';
import { Store } from '@ngrx/store';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { IChatDto } from 'src/app/api-client/api-client';
import { ActiveArea } from 'src/app/enums/active-areas';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { ApiService } from 'src/app/services/api.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ChatListItemStubComponent } from '../chat-list-item/chat-list-item.component.stub';

describe('ChatListComponent', () => {
    let component: ChatListComponent;
    let fixture: ComponentFixture<ChatListComponent>;
    let store: jasmine.SpyObj<Store>;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let apiService: jasmine.SpyObj<ApiService>;
    let fileStorageService: jasmine.SpyObj<FileStorageService>;

    beforeEach(async () => {
        store = jasmine.createSpyObj('Store', ['select']);
        storeService = jasmine.createSpyObj('StoreService', [
            'setSelectedChatId',
            'markAllAsRead',
            'setLayoutSettings',
        ]);
        apiService = jasmine.createSpyObj('ApiService', [
            'sendMessage',
            'markAsRead',
        ]);
        fileStorageService = jasmine.createSpyObj('FileStorageService', [
            'uploadImageAsBlob',
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
                { provide: ApiService, useValue: apiService },
                { provide: StoreService, useValue: storeService },
                { provide: FileStorageService, useValue: fileStorageService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
                { provide: Store, useValue: store },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatListComponent);
        component = fixture.componentInstance;
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

        idGeneratorService.isFake.and.returnValue(false);

        component.onChatSelected(chat);

        expect(storeService.setSelectedChatId).toHaveBeenCalledWith(chat.id);
        expect(storeService.markAllAsRead).toHaveBeenCalledWith(chat);
        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({
            activeArea: ActiveArea.chat,
        });
    });

    it('should not call markAllAsRead if chat ID is fake', () => {
        const chat: IChatDto = {
            id: 'fake-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        idGeneratorService.isFake.and.returnValue(true);

        component.onChatSelected(chat);

        expect(storeService.setSelectedChatId).toHaveBeenCalledWith(chat.id);
        expect(storeService.markAllAsRead).not.toHaveBeenCalled();
        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({
            activeArea: ActiveArea.chat,
        });
    });
});
