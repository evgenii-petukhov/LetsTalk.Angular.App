import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessengerComponent } from './messenger.component';
import { SignalrHandlerService } from 'src/app/services/signalr-handler.service';
import { StoreService } from 'src/app/services/store.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
    IChatDto,
    IMessageDto,
    ILinkPreviewDto,
    IImagePreviewDto,
} from 'src/app/api-client/api-client';
import { ActiveArea } from 'src/app/enums/active-areas';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';
import { StubChatComponent } from '../chat/chat.component.stub';
import { StubImageViewerComponent } from '../image-viewer/image-viewer.component.stub';
import { StubSidebarComponent } from '../sidebar/sidebar.component.stub';

describe('MessengerComponent', () => {
    let component: MessengerComponent;
    let fixture: ComponentFixture<MessengerComponent>;
    let signalrHandlerService: jasmine.SpyObj<SignalrHandlerService>;
    let storeService: jasmine.SpyObj<StoreService>;
    let store: jasmine.SpyObj<Store>;

    beforeEach(async () => {
        signalrHandlerService = jasmine.createSpyObj('SignalrHandlerService', [
            'initHandlers',
            'removeHandlers',
            'handleMessageNotification',
            'handleLinkPreviewNotification',
            'handleImagePreviewNotification',
        ]);
        storeService = jasmine.createSpyObj('StoreService', [
            'markAllAsRead',
            'initChatStorage',
        ]);
        store = jasmine.createSpyObj('Store', ['select']);

        await TestBed.configureTestingModule({
            declarations: [
                MessengerComponent,
                StubImageViewerComponent,
                StubSidebarComponent,
                StubChatComponent,
            ],
            providers: [
                {
                    provide: SignalrHandlerService,
                    useValue: signalrHandlerService,
                },
                { provide: StoreService, useValue: storeService },
                { provide: Store, useValue: store },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MessengerComponent);
        component = fixture.componentInstance;

        store.select.and.callFake((selector) => {
            if (selector === selectChats) {
                return of([]);
            } else if (selector === selectLayoutSettings) {
                return of({ activeArea: ActiveArea.sidebar });
            }
            return of(null);
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize chat storage and SignalR handlers on ngOnInit', async () => {
        // Arrange

        // Act
        await component.ngOnInit();

        // Assert
        expect(storeService.initChatStorage).toHaveBeenCalledTimes(1);
        expect(signalrHandlerService.initHandlers).toHaveBeenCalledTimes(1);
    });

    it('should handle visibility change event', () => {
        // Arrange
        component['selectedChat'] = { id: 'chatId' } as IChatDto;

        // Act
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.onVisibilityChange({ target: document } as any);

        // Assert
        expect(storeService.markAllAsRead).toHaveBeenCalledOnceWith(
            component['selectedChat'],
        );
    });

    it('should call removeHandlers on ngOnDestroy', () => {
        // Arrange

        // Act
        component.ngOnDestroy();

        // Assert
        expect(signalrHandlerService.removeHandlers).toHaveBeenCalledTimes(1);
    });

    it('should handle message notification', () => {
        // Arrange
        const messageDto = { chatId: 'chatId', isMine: false } as IMessageDto;

        // Act
        component.handleMessageNotification(messageDto);

        // Assert
        expect(
            signalrHandlerService.handleMessageNotification,
        ).toHaveBeenCalledOnceWith(messageDto, undefined, [], true);
    });

    it('should handle link preview notification', () => {
        // Arrange
        const linkPreviewDto = { chatId: 'chatId' } as ILinkPreviewDto;

        // Act
        component.handleLinkPreviewNotification(linkPreviewDto);

        // Assert
        expect(
            signalrHandlerService.handleLinkPreviewNotification,
        ).toHaveBeenCalledOnceWith(linkPreviewDto, undefined);
    });

    it('should handle image preview notification', () => {
        // Arrange
        const imagePreviewDto = { chatId: 'chatId' } as IImagePreviewDto;

        // Act
        component.handleImagePreviewNotification(imagePreviewDto);

        // Assert
        expect(
            signalrHandlerService.handleImagePreviewNotification,
        ).toHaveBeenCalledOnceWith(imagePreviewDto, undefined);
    });
});
