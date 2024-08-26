import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListItemComponent } from './chat-list-item.component';
import { IChatDto } from 'src/app/api-client/api-client';
import { AvatarStubComponent } from '../avatar/avatar.stub';

describe('ChatListItemComponent', () => {
    let component: ChatListItemComponent;
    let fixture: ComponentFixture<ChatListItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ChatListItemComponent,
                AvatarStubComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatListItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit chatSelected event when chat is clicked', () => {
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        component.chat = chat;
        fixture.detectChanges();

        spyOn(component.chatSelected, 'emit');

        const linkElement = fixture.nativeElement.querySelector('a');
        linkElement.click();

        expect(component.chatSelected.emit).toHaveBeenCalledWith(chat);
    });

    it('should display the chat name and unread count', () => {
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 5,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        component.chat = chat;
        fixture.detectChanges();

        const nameElement = fixture.nativeElement.querySelector('.user-name');
        expect(nameElement.textContent).toContain(chat.chatName);

        const unreadCountElement = fixture.nativeElement.querySelector('.unread-count');
        expect(unreadCountElement).toBeTruthy();
        expect(unreadCountElement.querySelector('.unread-count-text').textContent).toContain(chat.unreadCount.toString());
    });

    it('should not display unread count if unreadCount is not present', () => {
        const chat: IChatDto = {
            id: 'chat-id',
            chatName: 'Chat Name',
            unreadCount: 0,
            photoUrl: 'photo-url',
            imageId: 'image-id',
        };

        component.chat = chat;
        fixture.detectChanges();

        const unreadCountElement = fixture.nativeElement.querySelector('.unread-count');
        expect(unreadCountElement).toBeFalsy();
    });
});
