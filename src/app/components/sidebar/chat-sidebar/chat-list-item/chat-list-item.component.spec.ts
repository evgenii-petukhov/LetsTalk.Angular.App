import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListItemComponent } from './chat-list-item.component';
import { IChatDto, ImageDto } from 'src/app/api-client/api-client';
import { AvatarStubComponent } from '../../../shared/avatar/avatar.component.stub';
import { UserDetailsStubComponent } from '../../../shared/user-details/user-details.component.stub';
import { UnreadCountStubComponent } from '../unread-count/unread-count.component.stub';
import { By } from '@angular/platform-browser';

describe('ChatListItemComponent', () => {
    let component: ChatListItemComponent;
    let fixture: ComponentFixture<ChatListItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ChatListItemComponent,
                AvatarStubComponent,
                UserDetailsStubComponent,
                UnreadCountStubComponent,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatListItemComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render the AvatarComponent, UserDetailsComponent, and UnreadCountComponent with correct values', () => {
        // Arrange
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            image: new ImageDto({
                id: 'image-id',
                fileStorageTypeId: 1,
            })
        };

        // Act
        component.chat = chat;
        fixture.detectChanges();

        // Assert
        const avatarComponent = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        ).componentInstance as AvatarStubComponent;
        expect(avatarComponent.urlOptions).toEqual([
            chat.image,
            chat.photoUrl,
        ]);

        const userDetailsComponent = fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        ).componentInstance as UserDetailsStubComponent;
        expect(userDetailsComponent.value).toEqual(`${chat.chatName}`);

        const unreadCountComponent = fixture.debugElement.query(
            By.directive(UnreadCountStubComponent),
        ).componentInstance as UnreadCountStubComponent;
        expect(unreadCountComponent.value.toString()).toEqual(
            `${chat.unreadCount}`,
        );
    });

    it('should not render the UnreadCountComponent if unreadCount is zero', () => {
        // Arrange
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 0,
            photoUrl: 'photo-url',
            image: new ImageDto({
                id: 'image-id',
                fileStorageTypeId: 1,
            })
        };

        // Act
        component.chat = chat;
        fixture.detectChanges();

        // Assert
        const avatarComponent = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        ).componentInstance as AvatarStubComponent;
        expect(avatarComponent.urlOptions).toEqual([
            chat.image,
            chat.photoUrl,
        ]);

        const userDetailsComponent = fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        ).componentInstance as UserDetailsStubComponent;
        expect(userDetailsComponent.value).toEqual(`${chat.chatName}`);

        const unreadCountComponent = fixture.debugElement.query(
            By.directive(UnreadCountStubComponent),
        );
        expect(unreadCountComponent).toBeNull();
    });

    it('should emit chatSelected event when chat is clicked', () => {
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            image: new ImageDto({
                id: 'image-id',
                fileStorageTypeId: 1,
            })
        };

        component.chat = chat;
        fixture.detectChanges();

        spyOn(component.chatSelected, 'emit');

        const linkElement = fixture.nativeElement.querySelector('a');
        linkElement.click();

        expect(component.chatSelected.emit).toHaveBeenCalledWith(chat);
    });

    it('should emit an event when onChatSelected is called', () => {
        // Arrange
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            image: new ImageDto({
                id: 'image-id',
                fileStorageTypeId: 1,
            })
        };
        spyOn(component.chatSelected, 'emit');

        // Act
        component.chat = chat;
        fixture.detectChanges();

        component.onChatSelected();

        // Assert
        expect(component.chatSelected.emit).toHaveBeenCalledOnceWith(chat);
    });

    it('should emit an event when link element is clicked', () => {
        // Arrange
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            image: new ImageDto({
                id: 'image-id',
                fileStorageTypeId: 1,
            })
        };
        spyOn(component.chatSelected, 'emit');

        // Act
        component.chat = chat;
        fixture.detectChanges();

        fixture.debugElement
            .query(By.css('a'))
            .triggerEventHandler('click', null);

        // Assert
        expect(component.chatSelected.emit).toHaveBeenCalledOnceWith(chat);
    });
});
