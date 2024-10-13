import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMessageComponent } from './send-message.component';
import {
    DefaultProjectorFn,
    MemoizedSelector,
    Store,
    StoreModule,
} from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { IChatDto } from 'src/app/api-client/api-client';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SendMessageButtonStubComponent } from '../send-message-button/send-message-button.component.stub';
import { SelectImageButtonStubComponent } from '../select-image-button/select-image-button.component.stub';

describe('SendMessageComponent', () => {
    let component: SendMessageComponent;
    let fixture: ComponentFixture<SendMessageComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let errorService: jasmine.SpyObj<ErrorService>;
    let imageUploadService: jasmine.SpyObj<ImageUploadService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let store: MockStore;
    let mockSelectSelectedChat: MemoizedSelector<
        object,
        IChatDto,
        DefaultProjectorFn<IChatDto>
    >;

    const mockChat: IChatDto = {
        id: '123',
        accountTypeId: 1,
        chatName: 'Test Chat',
        unreadCount: 0,
        lastMessageDate: 12345,
        lastMessageId: '1',
        imageId: 'image123',
        isIndividual: false,
        accountIds: ['account1'],
    };

    beforeEach(async () => {
        apiService = jasmine.createSpyObj('ApiService', [
            'sendMessage',
            'createIndividualChat',
        ]);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);
        storeService = jasmine.createSpyObj('StoreService', [
            'addMessage',
            'setLastMessageInfo',
            'updateChatId',
            'setSelectedChatId',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);
        imageUploadService = jasmine.createSpyObj('ImageUploadService', [
            'resizeAndUploadImage',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                SendMessageComponent,
                SendMessageButtonStubComponent,
                SelectImageButtonStubComponent,
            ],
            imports: [FormsModule, StoreModule.forRoot({})],
            providers: [
                provideMockStore({}),
                { provide: ApiService, useValue: apiService },
                { provide: ErrorService, useValue: errorService },
                { provide: StoreService, useValue: storeService },
                {
                    provide: IdGeneratorService,
                    useValue: idGeneratorService,
                },
                {
                    provide: ImageUploadService,
                    useValue: imageUploadService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SendMessageComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectSelectedChat = store.overrideSelector(
            selectSelectedChat,
            null,
        );
    });

    it('should send a message and reset the message field', async () => {
        // Arrange
        mockSelectSelectedChat.setResult(mockChat);
        const message = 'Hello, world!';
        component.message = message;
        apiService.sendMessage.and.returnValue(Promise.resolve({}));

        // Act
        store.refreshState();
        fixture.detectChanges();
        await component.onSendMessage(message);

        // Assert
        expect(apiService.sendMessage).toHaveBeenCalledWith(
            mockChat.id,
            message,
            undefined,
        );
        expect(component.message).toBe('');
        expect(component.isSending).toBeFalse();
    });

    it('should handle image blob and send a message with image', async () => {
        // Arrange
        mockSelectSelectedChat.setResult(mockChat);
        const blob = new Blob(['image-data']);
        const mockImageResponse = new UploadImageResponse();
        imageUploadService.resizeAndUploadImage.and.returnValue(
            Promise.resolve(mockImageResponse),
        );
        apiService.sendMessage.and.returnValue(Promise.resolve({}));

        // Act
        store.refreshState();
        fixture.detectChanges();
        await component.onImageBlobReady(blob);

        // Assert
        expect(imageUploadService.resizeAndUploadImage).toHaveBeenCalled();
        expect(apiService.sendMessage).toHaveBeenCalledWith(
            mockChat.id,
            undefined,
            mockImageResponse,
        );
    });

    it('should handle errors during message sending', async () => {
        // Arrange
        mockSelectSelectedChat.setResult(mockChat);
        const error = new Error('Test Error');
        apiService.sendMessage.and.returnValue(Promise.reject(error));

        // Act
        store.refreshState();
        fixture.detectChanges();
        await component.onSendMessage('test');

        // Assert
        expect(errorService.handleError).toHaveBeenCalledWith(
            error,
            jasmine.any(String),
        );
        expect(component.isSending).toBeFalse();
    });
});
