import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import {
    ApiClient,
    EmailLoginRequest,
    UpdateProfileRequest,
    CreateMessageRequest,
    CreateIndividualChatRequest,
    GenerateLoginCodeRequest,
    StartOutgoingCallRequest,
    HandleIncomingCallRequest,
    LoginResponseDto,
    ChatDto,
    AccountDto,
    MessageDto,
    ProfileDto,
    GenerateLoginCodeResponseDto,
    CallSettingsDto,
} from '../api-client/api-client';
import { UploadImageResponse } from '../protos/file_upload_pb';
import { of } from 'rxjs';

describe('ApiService', () => {
    let service: ApiService;
    let apiClient: jasmine.SpyObj<ApiClient>;

    const mockMessage = new MessageDto({
        id: '1',
        text: 'Hello',
    });

    const mockMessages = [mockMessage];

    const mockProfile = new ProfileDto({
        firstName: 'John',
        lastName: 'Doe',
    });

    const mockChat = new ChatDto({
        id: '1',
        chatName: 'Chat 1',
    });

    const mockChats = [mockChat];

    beforeEach(() => {
        apiClient = jasmine.createSpyObj('ApiClient', [
            'emailLogin',
            'chatAll',
            'account',
            'messageAll',
            'profileGET',
            'profilePUT',
            'message',
            'chat',
            'markAsRead',
            'generateLoginCode',
            'startOutgoingCall',
            'handleIncomingCall',
            'callSettings',
        ]);

        TestBed.configureTestingModule({
            providers: [
                ApiService,
                { provide: ApiClient, useValue: apiClient },
            ],
        });

        service = TestBed.inject(ApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login by email', async () => {
        // Arrange
        const mockResponse = new LoginResponseDto({ success: true });
        apiClient.emailLogin.and.returnValue(of(mockResponse));

        // Act
        const result = await service.loginByEmail('test@example.com', 123456);

        // Assert
        expect(apiClient.emailLogin).toHaveBeenCalledWith(
            jasmine.any(EmailLoginRequest),
        );
        expect(result).toEqual(mockResponse);
    });

    it('should get chats', async () => {
        // Arrange
        apiClient.chatAll.and.returnValue(of(mockChats));

        // Act
        const result = await service.getChats();

        // Assert
        expect(apiClient.chatAll).toHaveBeenCalled();
        expect(result).toEqual(mockChats);
    });

    it('should get accounts', async () => {
        // Arrange
        const mockAccounts = [
            new AccountDto({
                id: '1',
                firstName: 'John',
            }),
        ];
        apiClient.account.and.returnValue(of(mockAccounts));

        // Act
        const result = await service.getAccounts();

        // Assert
        expect(apiClient.account).toHaveBeenCalled();
        expect(result).toEqual(mockAccounts);
    });

    it('should get messages', async () => {
        // Arrange
        apiClient.messageAll.and.returnValue(of(mockMessages));

        // Act
        const result = await service.getMessages('chatId', 0);

        // Assert
        expect(apiClient.messageAll).toHaveBeenCalledWith('chatId', undefined);
        expect(result).toEqual(mockMessages);
    });

    it('should get profile', async () => {
        // Arrange
        apiClient.profileGET.and.returnValue(of(mockProfile));

        // Act
        const result = await service.getProfile();

        // Assert
        expect(apiClient.profileGET).toHaveBeenCalled();
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

        apiClient.profilePUT.and.returnValue(of(mockProfile));

        // Act
        const result = await service.saveProfile('John', 'Doe', mockImage);

        // Assert
        expect(apiClient.profilePUT).toHaveBeenCalledWith(
            jasmine.any(UpdateProfileRequest),
        );
        expect(result).toEqual(mockProfile);
    });

    it('should send a message', async () => {
        // Arrange
        apiClient.message.and.returnValue(of(mockMessage));

        // Act
        const result = await service.sendMessage('chatId', 'Hello');

        // Assert
        expect(apiClient.message).toHaveBeenCalledWith(
            jasmine.any(CreateMessageRequest),
        );
        expect(result).toEqual(mockMessage);
    });

    it('should create individual chat', async () => {
        // Arrange
        apiClient.chat.and.returnValue(of(mockChat));

        // Act
        const result = await service.createIndividualChat('accountId');

        // Assert
        expect(apiClient.chat).toHaveBeenCalledWith(
            jasmine.any(CreateIndividualChatRequest),
        );
        expect(result).toEqual(mockChat);
    });

    it('should mark message as read', async () => {
        // Arrange
        apiClient.markAsRead.and.returnValue(of(undefined));

        // Act
        const result = await service.markAsRead('chatId', 'messageId');

        // Assert
        expect(apiClient.markAsRead).toHaveBeenCalledWith(
            'chatId',
            'messageId',
        );
        expect(result).toBeUndefined();
    });

    it('should generate login code', async () => {
        // Arrange
        const mockResponse = new GenerateLoginCodeResponseDto();
        apiClient.generateLoginCode.and.returnValue(of(mockResponse));

        // Act
        const result = await service.generateLoginCode('test@example.com');

        // Assert
        expect(apiClient.generateLoginCode).toHaveBeenCalledWith(
            jasmine.any(GenerateLoginCodeRequest),
        );
        expect(result).toEqual(mockResponse);
    });

    it('should start outgoing call', async () => {
        // Arrange
        apiClient.startOutgoingCall.and.returnValue(of(undefined));

        // Act
        const result = await service.startOutgoingCall('chatId', 'offer-sdp');

        // Assert
        expect(apiClient.startOutgoingCall).toHaveBeenCalledWith(
            jasmine.any(StartOutgoingCallRequest),
        );
        expect(result).toBeUndefined();
    });

    it('should handle incoming call', async () => {
        // Arrange
        apiClient.handleIncomingCall.and.returnValue(of(undefined));

        // Act
        const result = await service.handleIncomingCall('chatId', 'answer-sdp');

        // Assert
        expect(apiClient.handleIncomingCall).toHaveBeenCalledWith(
            jasmine.any(HandleIncomingCallRequest),
        );
        expect(result).toBeUndefined();
    });

    it('should get call settings', async () => {
        // Arrange
        const mockCallSettings = new CallSettingsDto();
        apiClient.callSettings.and.returnValue(of(mockCallSettings));

        // Act
        const result = await service.getCallSettings();

        // Assert
        expect(apiClient.callSettings).toHaveBeenCalled();
        expect(result).toEqual(mockCallSettings);
    });
});
