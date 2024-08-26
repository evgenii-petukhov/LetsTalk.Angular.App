import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessengerComponent } from './messenger.component';
import { ApiService } from '../../services/api.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { IChatDto, IMessageDto, ILinkPreviewDto, IImagePreviewDto } from 'src/app/api-client/api-client';
import { ActiveArea } from 'src/app/enums/active-areas';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { selectViewedImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
import { StubChatComponent } from '../chat/chat.component.stub';
import { StubImageViewerComponent } from '../image-viewer/image-viewer.component.stub';
import { StubSidebarComponent } from '../sidebar/sidebar.component.stub';

describe('MessengerComponent', () => {
    let component: MessengerComponent;
    let fixture: ComponentFixture<MessengerComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let signalrService: jasmine.SpyObj<SignalrService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let store: jasmine.SpyObj<Store>;

    beforeEach(async () => {
        apiService = jasmine.createSpyObj('ApiService', ['markAsRead']);
        signalrService = jasmine.createSpyObj('SignalrService', ['init', 'removeHandlers']);
        notificationService = jasmine.createSpyObj('NotificationService', ['showNotification']);
        storeService = jasmine.createSpyObj('StoreService', ['markAllAsRead', 'initChatStorage', 'setLastMessageInfo', 'addMessage', 'incrementUnreadMessages', 'setLinkPreview', 'setImagePreview']);
        store = jasmine.createSpyObj('Store', ['select']);

        await TestBed.configureTestingModule({
            declarations: [MessengerComponent, StubImageViewerComponent, StubSidebarComponent, StubChatComponent],
            providers: [
                { provide: ApiService, useValue: apiService },
                { provide: SignalrService, useValue: signalrService },
                { provide: NotificationService, useValue: notificationService },
                { provide: StoreService, useValue: storeService },
                { provide: Store, useValue: store },
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerComponent);
        component = fixture.componentInstance;

        store.select.and.callFake(selector => {
            if (selector === selectChats) {
                return of([]);
            } else if (selector === selectSelectedChat) {
                return of(null);
            } else if (selector === selectLayoutSettings) {
                return of({ activeArea: ActiveArea.sidebar });
            } else if (selector === selectSelectedChatId || selector === selectViewedImageId) {
                return of(null);
            }
            return of(null);
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize chat storage on ngOnInit', async () => {
        await component.ngOnInit();
        expect(storeService.initChatStorage).toHaveBeenCalled();
        expect(signalrService.init).toHaveBeenCalled();
    });

    it('should handle visibility change event', () => {
        (component as any)['selectedChat'] = { id: 'chatId' } as IChatDto;

        component.onVisibilityChange({ target: document } as any);

        expect(storeService.markAllAsRead).toHaveBeenCalledWith((component as any)['selectedChat']);
    });

    it('should call removeHandlers on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(signalrService.removeHandlers).toHaveBeenCalled();
    });

    it('should handle message notification when message is from the same chat', () => {
        (component as any)['selectedChat'] = { id: 'chatId' } as IChatDto;
        const messageDto = { chatId: 'chatId', isMine: false } as IMessageDto;
        apiService.markAsRead.and.returnValue(of());

        component.handleMessageNotification(messageDto);

        expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(messageDto.chatId, messageDto.created, messageDto.id);
        expect(storeService.addMessage).toHaveBeenCalledWith(messageDto);
        expect(apiService.markAsRead).toHaveBeenCalled();
    });

    it('should handle message notification when message is from a different chat', () => {
        const messageDto = { chatId: 'otherChatId', isMine: false } as IMessageDto;
        const chat = { id: 'otherChatId', chatName: 'Other Chat' } as IChatDto;

        component['chats'] = [chat];

        component.handleMessageNotification(messageDto);

        expect(storeService.incrementUnreadMessages).toHaveBeenCalledWith(messageDto.chatId);
        expect(notificationService.showNotification).toHaveBeenCalledWith(
            `${chat.chatName}`,
            messageDto.imageId ? 'Image' : messageDto.text,
            true
        );
    });

    it('should handle link preview notification for the current chat', () => {
        (component as any)['selectedChat'] = { id: 'chatId' } as IChatDto;
        const linkPreviewDto = { chatId: 'chatId' } as ILinkPreviewDto;

        component.handleLinkPreviewNotification(linkPreviewDto);

        expect(storeService.setLinkPreview).toHaveBeenCalledWith(linkPreviewDto);
    });

    it('should handle image preview notification for the current chat', () => {
        (component as any)['selectedChat'] = { id: 'chatId' } as IChatDto;
        const imagePreviewDto = { chatId: 'chatId' } as IImagePreviewDto;

        component.handleImagePreviewNotification(imagePreviewDto);

        expect(storeService.setImagePreview).toHaveBeenCalledWith(imagePreviewDto);
    });
});
