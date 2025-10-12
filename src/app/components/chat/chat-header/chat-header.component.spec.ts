import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { ChatHeaderComponent } from './chat-header.component';
import { StoreService } from 'src/app/services/store.service';
import { ActiveArea } from 'src/app/enums/active-areas';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { AvatarStubComponent } from '../../shared/avatar/avatar.component.stub';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IChatDto, ImageDto } from 'src/app/api-client/api-client';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { UserDetailsStubComponent } from '../../shared/user-details/user-details.component.stub';

describe('ChatHeaderComponent', () => {
    let component: ChatHeaderComponent;
    let fixture: ComponentFixture<ChatHeaderComponent>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let mockSelectSelectedChat: MemoizedSelector<
        object,
        IChatDto,
        DefaultProjectorFn<IChatDto>
    >;

    const mockChat = {
        chatName: 'Chat1',
        image: new ImageDto({
            id: 'img1',
            fileStorageTypeId: 1
        }),
        photoUrl: 'url1',
    };

    const mockChat2 = {
        chatName: 'Chat2',
        image: new ImageDto({
            id: 'img2',
            fileStorageTypeId: 1
        }),
        photoUrl: 'url2',
    };

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'setLayoutSettings',
            'setSelectedChatId',
        ]);

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
            ],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatHeaderComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectSelectedChat = store.overrideSelector(
            selectSelectedChat,
            null,
        );
    });

    it('should call setLayoutSettings and setSelectedChatId on back button click', () => {
        // Arrange

        // Act
        component.onBackClicked();

        // Assert
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            activeArea: ActiveArea.sidebar,
        });
        expect(storeService.setSelectedChatId).toHaveBeenCalledOnceWith(null);
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

    function getAvatarElement() {
        return fixture.debugElement.query(By.directive(AvatarStubComponent));
    }

    function getUserNameElement() {
        return fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        ).componentInstance as UserDetailsStubComponent;
    }
});
