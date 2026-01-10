import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { ChatHeaderComponent } from './chat-header.component';
import { StoreService } from 'src/app/services/store.service';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { AvatarStubComponent } from '../../shared/avatar/avatar.component.stub';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IChatDto, ImageDto } from 'src/app/api-client/api-client';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { UserDetailsStubComponent } from '../../shared/user-details/user-details.component.stub';
import { ApiService } from 'src/app/services/api.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { Router } from '@angular/router';

describe('ChatHeaderComponent', () => {
    let fixture: ComponentFixture<ChatHeaderComponent>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let apiService: jasmine.SpyObj<ApiService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let router: jasmine.SpyObj<Router>;
    let mockSelectSelectedChat: MemoizedSelector<
        object,
        IChatDto,
        DefaultProjectorFn<IChatDto>
    >;

    const mockChat = {
        id: 'chat1',
        chatName: 'Chat1',
        image: new ImageDto({
            id: 'img1',
            fileStorageTypeId: 1,
        }),
        photoUrl: 'url1',
        isIndividual: false,
        accountIds: ['account1'],
    } as IChatDto;

    const mockChat2 = {
        id: 'chat2',
        chatName: 'Chat2',
        image: new ImageDto({
            id: 'img2',
            fileStorageTypeId: 1,
        }),
        photoUrl: 'url2',
        isIndividual: false,
        accountIds: ['account2'],
    } as IChatDto;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'setSelectedChatId',
            'initOutgoingCall',
            'updateChatId',
        ]);
        apiService = jasmine.createSpyObj('ApiService', [
            'createIndividualChat',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);
        router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.resolveTo(true);

        await TestBed.configureTestingModule({
            declarations: [
                ChatHeaderComponent,
                AvatarStubComponent,
                UserDetailsStubComponent,
                OrderByPipe,
            ],
            providers: [
                provideMockStore({}),
                { provide: StoreService, useValue: storeService },
                { provide: ApiService, useValue: apiService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
                { provide: Router, useValue: router },
            ],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatHeaderComponent);
        store = TestBed.inject(Store) as MockStore;
        mockSelectSelectedChat = store.overrideSelector(
            selectSelectedChat,
            null,
        );
    });

    it('should display the chat name and pass correct urlOptions to app-avatar', () => {
        // Arrange
        mockSelectSelectedChat.setResult(mockChat);

        // Act
        store.refreshState();
        fixture.detectChanges();

        expect(getUserNameElement().value).toContain(mockChat.chatName);

        // Assert
        expect(getAvatarElement().componentInstance.urlOptions).toEqual([
            mockChat.image,
            mockChat.photoUrl,
        ]);

        // Arrange
        mockSelectSelectedChat.setResult(mockChat2);

        // Act
        store.refreshState();
        fixture.detectChanges();

        expect(getUserNameElement().value).toContain(mockChat2.chatName);

        // Assert
        expect(getAvatarElement().componentInstance.urlOptions).toEqual([
            mockChat2.image,
            mockChat2.photoUrl,
        ]);
    });

    it('should call initVideoCall with existing chat id when onCallClicked', async () => {
        // Arrange
        mockSelectSelectedChat.setResult(mockChat);
        store.refreshState();
        fixture.detectChanges();

        // Act
        await fixture.componentInstance.onCallClicked();

        // Assert
        expect(storeService.initOutgoingCall).toHaveBeenCalledWith(mockChat.id);
        expect(apiService.createIndividualChat).not.toHaveBeenCalled();
        expect(storeService.updateChatId).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should create individual chat and call initVideoCall when chat is individual with fake id', async () => {
        // Arrange
        const individualChat = {
            ...mockChat,
            isIndividual: true,
            id: 'fake-id',
        };
        const createdChat = { ...individualChat, id: 'real-chat-id' };

        mockSelectSelectedChat.setResult(individualChat);
        idGeneratorService.isFake.and.returnValue(true);
        apiService.createIndividualChat.and.resolveTo(createdChat);

        store.refreshState();
        fixture.detectChanges();

        // Act
        await fixture.componentInstance.onCallClicked();

        // Assert
        expect(apiService.createIndividualChat).toHaveBeenCalledWith(
            individualChat.accountIds[0],
        );
        expect(storeService.updateChatId).toHaveBeenCalledWith(
            individualChat.id,
            createdChat.id,
        );
        expect(router.navigate).toHaveBeenCalledWith([
            '/messenger/chat',
            createdChat.id,
        ]);
        expect(storeService.initOutgoingCall).toHaveBeenCalledWith(createdChat.id);
    });

    it('should not create individual chat when chat is individual but id is not fake', async () => {
        // Arrange
        const individualChat = { ...mockChat, isIndividual: true };

        mockSelectSelectedChat.setResult(individualChat);
        idGeneratorService.isFake.and.returnValue(false);

        store.refreshState();
        fixture.detectChanges();

        // Act
        await fixture.componentInstance.onCallClicked();

        // Assert
        expect(apiService.createIndividualChat).not.toHaveBeenCalled();
        expect(storeService.updateChatId).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(storeService.initOutgoingCall).toHaveBeenCalledWith(individualChat.id);
    });

    it('should handle null chat gracefully when onCallClicked', async () => {
        // Arrange
        mockSelectSelectedChat.setResult(null);
        store.refreshState();
        fixture.detectChanges();

        // Act
        await fixture.componentInstance.onCallClicked();

        // Assert
        expect(storeService.initOutgoingCall).not.toHaveBeenCalled();
        expect(apiService.createIndividualChat).not.toHaveBeenCalled();
    });

    function getAvatarElement() {
        return fixture.debugElement.query(By.directive(AvatarStubComponent));
    }

    function getUserNameElement() {
        return fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        ).componentInstance as UserDetailsStubComponent;
    }
});
