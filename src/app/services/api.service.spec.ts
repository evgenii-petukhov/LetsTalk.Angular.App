import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { ApiClient, EmailLoginRequest, UpdateProfileRequest, CreateMessageRequest, CreateIndividualChatRequest, GenerateLoginCodeRequest, LoginResponseDto, ChatDto, AccountDto, MessageDto, ProfileDto, GenerateLoginCodeResponseDto } from '../api-client/api-client';
import { UploadImageResponse } from '../protos/file_upload_pb';
import { of } from 'rxjs';

describe('ApiService', () => {
    let service: ApiService;
    let apiClientSpy: jasmine.SpyObj<ApiClient>;

    const mockMessage = new MessageDto({
        id: '1',
        text: 'Hello'
    });

    const mockMessages = [
        mockMessage
    ];

    const mockProfile = new ProfileDto({
        firstName: 'John',
        lastName: 'Doe'
    });

    const mockChat = new ChatDto({
        id: '1',
        chatName: 'Chat 1'
    });

    const mockChats = [
        mockChat
    ];

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
        // Arrange
        const mockResponse = new LoginResponseDto({ success: true });
        apiClientSpy.emailLogin.and.returnValue(of(mockResponse));

        // Act
        const result = await service.loginByEmail('test@example.com', 123456);

        // Assert
        expect(apiClientSpy.emailLogin).toHaveBeenCalledWith(jasmine.any(EmailLoginRequest));
        expect(result).toEqual(mockResponse);
    });

    it('should get chats', async () => {
        // Arrange
        apiClientSpy.chatAll.and.returnValue(of(mockChats));

        // Act
        const result = await service.getChats();

        // Assert
        expect(apiClientSpy.chatAll).toHaveBeenCalled();
        expect(result).toEqual(mockChats);
    });

    it('should get accounts', async () => {
        // Arrange
        const mockAccounts = [
            new AccountDto({
                id: '1',
                firstName: 'John'
            })
        ];
        apiClientSpy.account.and.returnValue(of(mockAccounts));

        // Act
        const result = await service.getAccounts();

        // Assert
        expect(apiClientSpy.account).toHaveBeenCalled();
        expect(result).toEqual(mockAccounts);
    });

    it('should get messages', async () => {
        // Arrange
        apiClientSpy.messageAll.and.returnValue(of(mockMessages));

        // Act
        const result = await service.getMessages('chatId', 0);

        // Assert
        expect(apiClientSpy.messageAll).toHaveBeenCalledWith('chatId', undefined);
        expect(result).toEqual(mockMessages);
    });

    it('should get profile', async () => {
        // Arrange
        apiClientSpy.profileGET.and.returnValue(of(mockProfile));

        // Act
        const result = await service.getProfile();

        // Assert
        expect(apiClientSpy.profileGET).toHaveBeenCalled();
        expect(result).toEqual(mockProfile);
    });

    it('should save profile', async () => {
        // Arrange
        const mockImage = new UploadImageResponse();
        mockImage.setId('imageId');
        mockImage.setWidth(100);
        mockImage.setHeight(100);
        mockImage.setImageFormat(1);
        mockImage.setSignature('signature');

        apiClientSpy.profilePUT.and.returnValue(of(mockProfile));

        // Act
        const result = await service.saveProfile('John', 'Doe', mockImage);

        // Assert
        expect(apiClientSpy.profilePUT).toHaveBeenCalledWith(jasmine.any(UpdateProfileRequest));
        expect(result).toEqual(mockProfile);
    });

    it('should send a message', async () => {
        // Arrange
        apiClientSpy.message.and.returnValue(of(mockMessage));

        // Act
        const result = await service.sendMessage('chatId', 'Hello');

        // Assert
        expect(apiClientSpy.message).toHaveBeenCalledWith(jasmine.any(CreateMessageRequest));
        expect(result).toEqual(mockMessage);
    });

    it('should create individual chat', async () => {
        // Arrange
        apiClientSpy.chat.and.returnValue(of(mockChat));

        // Act
        const result = await service.createIndividualChat('accountId');

        // Assert
        expect(apiClientSpy.chat).toHaveBeenCalledWith(jasmine.any(CreateIndividualChatRequest));
        expect(result).toEqual(mockChat);
    });

    it('should mark message as read', async () => {
        // Arrange
        apiClientSpy.markAsRead.and.returnValue(of(undefined));

        // Act
        const result = await service.markAsRead('chatId', 'messageId');

        // Assert
        expect(apiClientSpy.markAsRead).toHaveBeenCalledWith('chatId', 'messageId');
        expect(result).toBeUndefined();
    });

    it('should generate login code', async () => {
        // Arrange
        const mockResponse = new GenerateLoginCodeResponseDto();
        apiClientSpy.generateLoginCode.and.returnValue(of(mockResponse));

        // Act
        const result = await service.generateLoginCode('test@example.com');

        // Assert
        expect(apiClientSpy.generateLoginCode).toHaveBeenCalledWith(jasmine.any(GenerateLoginCodeRequest));
        expect(result).toEqual(mockResponse);
    });
});
