import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { ApiClient, EmailLoginRequest, UpdateProfileRequest, CreateMessageRequest, CreateIndividualChatRequest, GenerateLoginCodeRequest, LoginResponseDto } from '../api-client/api-client';
import { UploadImageResponse } from '../protos/file_upload_pb';
import { of } from 'rxjs';

describe('ApiService', () => {
    let service: ApiService;
    let apiClientSpy: jasmine.SpyObj<ApiClient>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiClient', [
            'emailLogin',
            'chatAll',
            'account',
            'messageAll',
            'profileGET',
            'profilePUT',
            'message',
            'chat',
            'markAsRead',
            'generateLoginCode'
        ]);

        TestBed.configureTestingModule({
            providers: [
                ApiService,
                { provide: ApiClient, useValue: spy }
            ]
        });

        service = TestBed.inject(ApiService);
        apiClientSpy = TestBed.inject(ApiClient) as jasmine.SpyObj<ApiClient>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login by email', async () => {
        const mockResponse = new LoginResponseDto({ success: true });
        apiClientSpy.emailLogin.and.returnValue(of(mockResponse));

        const result = await service.loginByEmail('test@example.com', 123456);

        expect(apiClientSpy.emailLogin).toHaveBeenCalledWith(jasmine.any(EmailLoginRequest));
        expect(result).toEqual(mockResponse);
    });

    it('should get chats', async () => {
        const mockChats = [{ id: '1', chatName: 'Chat 1' }] as any;
        apiClientSpy.chatAll.and.returnValue(of(mockChats));

        const result = await service.getChats();

        expect(apiClientSpy.chatAll).toHaveBeenCalled();
        expect(result).toEqual(mockChats);
    });

    it('should get accounts', async () => {
        const mockAccounts = [{ id: '1', firstName: 'John' }] as any;
        apiClientSpy.account.and.returnValue(of(mockAccounts));

        const result = await service.getAccounts();

        expect(apiClientSpy.account).toHaveBeenCalled();
        expect(result).toEqual(mockAccounts);
    });

    it('should get messages', async () => {
        const mockMessages = [{ id: '1', text: 'Hello' }] as any;
        apiClientSpy.messageAll.and.returnValue(of(mockMessages));

        const result = await service.getMessages('chatId', 0);

        expect(apiClientSpy.messageAll).toHaveBeenCalledWith('chatId', undefined);
        expect(result).toEqual(mockMessages);
    });

    it('should get profile', async () => {
        const mockProfile = { firstName: 'John', lastName: 'Doe' } as any;
        apiClientSpy.profileGET.and.returnValue(of(mockProfile));

        const result = await service.getProfile();

        expect(apiClientSpy.profileGET).toHaveBeenCalled();
        expect(result).toEqual(mockProfile);
    });

    it('should save profile', async () => {
        const mockImage = new UploadImageResponse();
        mockImage.setId('imageId');
        mockImage.setWidth(100);
        mockImage.setHeight(100);
        mockImage.setImageFormat(1);
        mockImage.setSignature('signature');

        const mockProfile = { firstName: 'John', lastName: 'Doe' } as any;
        apiClientSpy.profilePUT.and.returnValue(of(mockProfile));

        const result = await service.saveProfile('John', 'Doe', mockImage);

        expect(apiClientSpy.profilePUT).toHaveBeenCalledWith(jasmine.any(UpdateProfileRequest));
        expect(result).toEqual(mockProfile);
    });

    it('should send a message', async () => {
        const mockMessage = { id: '1', text: 'Hello' } as any;
        apiClientSpy.message.and.returnValue(of(mockMessage));

        const result = await service.sendMessage('chatId', 'Hello');

        expect(apiClientSpy.message).toHaveBeenCalledWith(jasmine.any(CreateMessageRequest));
        expect(result).toEqual(mockMessage);
    });

    it('should create individual chat', async () => {
        const mockChat = { id: '1', chatName: 'Chat 1' } as any;
        apiClientSpy.chat.and.returnValue(of(mockChat));

        const result = await service.createIndividualChat('accountId');

        expect(apiClientSpy.chat).toHaveBeenCalledWith(jasmine.any(CreateIndividualChatRequest));
        expect(result).toEqual(mockChat);
    });

    it('should mark message as read', async () => {
        apiClientSpy.markAsRead.and.returnValue(of(undefined));

        const result = await service.markAsRead('chatId', 'messageId');

        expect(apiClientSpy.markAsRead).toHaveBeenCalledWith('chatId', 'messageId');
        expect(result).toBeUndefined();
    });

    it('should generate login code', async () => {
        const mockResponse = { success: true } as any;
        apiClientSpy.generateLoginCode.and.returnValue(of(mockResponse));

        const result = await service.generateLoginCode('test@example.com');

        expect(apiClientSpy.generateLoginCode).toHaveBeenCalledWith(jasmine.any(GenerateLoginCodeRequest));
        expect(result).toEqual(mockResponse);
    });
});
