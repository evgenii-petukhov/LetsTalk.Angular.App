import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMessageComponent } from './send-message.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { UploadImageResponse } from 'src/app/protos/file_upload_pb';

describe('SendMessageComponent', () => {
    let component: SendMessageComponent;
    let fixture: ComponentFixture<SendMessageComponent>;
    let store: jasmine.SpyObj<Store>;
    let apiService: jasmine.SpyObj<ApiService>;
    let errorService: jasmine.SpyObj<ErrorService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let imageUploadService: jasmine.SpyObj<ImageUploadService>;

    beforeEach(async () => {
        store = jasmine.createSpyObj('Store', ['select']);
        store.select.and.returnValues(of('chatId1'), of({ id: 'chatId1', accountIds: ['accountId1'], isIndividual: true }));
        apiService = jasmine.createSpyObj('ApiService', ['sendMessage', 'createIndividualChat']);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);
        storeService = jasmine.createSpyObj('StoreService', ['updateChatId', 'setSelectedChatId', 'addMessage', 'setLastMessageInfo']);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', ['isFake']);
        imageUploadService = jasmine.createSpyObj('ImageUploadService', ['resizeAndUploadImage']);

        await TestBed.configureTestingModule({
            declarations: [SendMessageComponent],
            imports: [FormsModule, FontAwesomeModule],
            providers: [
                { provide: Store, useValue: store },
                { provide: ApiService, useValue: apiService },
                { provide: ErrorService, useValue: errorService },
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
                { provide: ImageUploadService, useValue: imageUploadService },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SendMessageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize chat and chatId on ngOnInit', () => {
        component.ngOnInit();
        expect(component['chatId']).toBe('chatId1');
        expect(component['chat']).toEqual({ id: 'chatId1', accountIds: ['accountId1'], isIndividual: true });
    });

    it('should send message and reset message field', async () => {
        component.message = 'Test message';
        (component as any)['chat'] = {
            isIndividual: true
        };
        (component as any)['chatId'] = 'chatId1';
        idGeneratorService.isFake.and.returnValue(false);
        apiService.sendMessage.and.returnValue(Promise.resolve({ id: 'msgId1', created: Date.now() }));

        await component.send('Test message');

        expect(component.message).toBe('');
        expect(component.isSending).toBe(false);
        expect(apiService.sendMessage).toHaveBeenCalledWith('chatId1', 'Test message');
        expect(idGeneratorService.isFake).toHaveBeenCalledWith('chatId1');
        expect(storeService.addMessage).toHaveBeenCalled();
    });

    it('should create individual chat if necessary before sending message', async () => {
        (component as any)['chat'] = {
            isIndividual: true,
            accountIds: ['accountId1']
        };
        (component as any)['chatId'] = 'chatId1';
        idGeneratorService.isFake.and.returnValue(true);
        apiService.createIndividualChat.and.returnValue(Promise.resolve({ id: 'newChatId' }));
        apiService.sendMessage.and.returnValue(Promise.resolve({ id: 'msgId1', created: Date.now() }));

        await component.send('Test message');

        expect(apiService.createIndividualChat).toHaveBeenCalledWith('accountId1');
        expect(apiService.sendMessage).toHaveBeenCalledWith('newChatId', 'Test message');
        expect(storeService.updateChatId).toHaveBeenCalledWith('chatId1', 'newChatId');
        expect(storeService.setSelectedChatId).toHaveBeenCalledWith('newChatId');
        expect(idGeneratorService.isFake).toHaveBeenCalledWith('chatId1');
    });

    it('should handle errors during message sending', async () => {
        const error = new Error('Send message failed');
        apiService.sendMessage.and.throwError(error);

        (component as any)['chat'] = {
            isIndividual: true
        };

        await component.send('Test message');

        expect(component.message).toBe('');
        expect(component.isSending).toBe(false);
        expect(errorService.handleError).toHaveBeenCalledWith(error, jasmine.any(String));
    });

    it('should handle image selection and upload', async () => {
        const mockFile = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const event = { target: { files: [mockFile] } } as any;
        const imageUrl = 'data:image/png;base64,...';
        const mockMessageDto = { id: 'msgId1', created: Date.now(), isMine: true };

        spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);
        const mockUploadResponse = new UploadImageResponse();
        mockUploadResponse.setId('imageId');
        imageUploadService.resizeAndUploadImage.and.returnValue(Promise.resolve(mockUploadResponse));
        apiService.sendMessage.and.returnValue(Promise.resolve(mockMessageDto));

        await component.onImageSelected(event);

        expect(imageUploadService.resizeAndUploadImage).toHaveBeenCalledWith(imageUrl, jasmine.any(Number), jasmine.any(Number), jasmine.any(Number));
        expect(apiService.sendMessage).toHaveBeenCalled();
        expect(storeService.addMessage).toHaveBeenCalledWith(mockMessageDto);
    });

    it('should handle errors during image upload', async () => {
        const mockFile = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const event = { target: { files: [mockFile] } } as any;
        const imageUrl = 'data:image/png;base64,...';
        const error = new Error('Upload failed');

        spyOn(URL, 'createObjectURL').and.returnValue(imageUrl);
        imageUploadService.resizeAndUploadImage.and.throwError(error);

        await component.onImageSelected(event);

        expect(errorService.handleError).toHaveBeenCalledWith(error, jasmine.any(String));
    });

    it('should disable the send button when message is empty or isSending is true', () => {
        component.message = '';
        fixture.detectChanges();
        let sendButton = fixture.debugElement.query(By.css('button[title="Send (Ctrl+Enter)"]'));
        expect(sendButton.nativeElement.disabled).toBeTrue();

        component.message = 'Test message';
        component.isSending = true;
        fixture.detectChanges();
        sendButton = fixture.debugElement.query(By.css('button[title="Send (Ctrl+Enter)"]'));
        expect(sendButton.nativeElement.disabled).toBeTrue();
    });
});
