import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type MockedObject,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessengerComponent } from './messenger.component';
import { SignalrHandlerService } from '../../services/signalr-handler.service';
import { StoreService } from '../../services/store.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
    IChatDto,
    IMessageDto,
    ILinkPreviewDto,
    IImagePreviewDto,
} from '../../api-client/api-client';
import { selectChats } from '../../state/chats/chats.selector';
import { StubChatComponent } from '../chat/chat.component.stub';
import { StubImageViewerComponent } from '../image-viewer/image-viewer.component.stub';
import { StubSidebarComponent } from '../sidebar/sidebar.component.stub';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MessengerComponent', () => {
    let component: MessengerComponent;
    let fixture: ComponentFixture<MessengerComponent>;
    let signalrHandlerService: MockedObject<SignalrHandlerService>;
    let storeService: MockedObject<StoreService>;
    let store: MockedObject<Store>;

    beforeEach(async () => {
        signalrHandlerService = {
            initHandlers: vi
                .fn()
                .mockName('SignalrHandlerService.initHandlers'),
            removeHandlers: vi
                .fn()
                .mockName('SignalrHandlerService.removeHandlers'),
            handleMessageNotification: vi
                .fn()
                .mockName('SignalrHandlerService.handleMessageNotification'),
            handleLinkPreviewNotification: vi
                .fn()
                .mockName(
                    'SignalrHandlerService.handleLinkPreviewNotification',
                ),
            handleImagePreviewNotification: vi
                .fn()
                .mockName(
                    'SignalrHandlerService.handleImagePreviewNotification',
                ),
        } as MockedObject<SignalrHandlerService>;

        storeService = {
            markAllAsRead: vi.fn().mockName('StoreService.markAllAsRead'),
            initChatStorage: vi.fn().mockName('StoreService.initChatStorage'),
            setSelectedChatId: vi
                .fn()
                .mockName('StoreService.setSelectedChatId'),
        } as MockedObject<StoreService>;

        store = {
            select: vi.fn().mockName('Store.select'),
        } as MockedObject<Store>;

        await TestBed.configureTestingModule({
            declarations: [
                MessengerComponent,
                StubImageViewerComponent,
                StubSidebarComponent,
                StubChatComponent,
            ],
            imports: [CommonModule, RouterTestingModule],
            providers: [
                {
                    provide: SignalrHandlerService,
                    useValue: signalrHandlerService,
                },
                { provide: StoreService, useValue: storeService },
                { provide: Store, useValue: store },
                {
                    provide: ActivatedRoute,
                    useValue: { firstChild: null, params: of({}) },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MessengerComponent);
        component = fixture.componentInstance;

        store.select.mockImplementation((selector) => {
            if (selector === selectChats) {
                return of([]);
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
        expect(storeService.markAllAsRead).toHaveBeenCalledTimes(1);

        // Assert
        expect(storeService.markAllAsRead).toHaveBeenCalledWith(
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
        ).toHaveBeenCalledTimes(1);

        // Assert
        expect(
            signalrHandlerService.handleMessageNotification,
        ).toHaveBeenCalledWith(messageDto, undefined, [], true);
    });

    it('should handle link preview notification', () => {
        // Arrange
        const linkPreviewDto = { chatId: 'chatId' } as ILinkPreviewDto;

        // Act
        component.handleLinkPreviewNotification(linkPreviewDto);

        // Assert
        expect(
            signalrHandlerService.handleLinkPreviewNotification,
        ).toHaveBeenCalledTimes(1);

        // Assert
        expect(
            signalrHandlerService.handleLinkPreviewNotification,
        ).toHaveBeenCalledWith(linkPreviewDto, undefined);
    });

    it('should handle image preview notification', () => {
        // Arrange
        const imagePreviewDto = { chatId: 'chatId' } as IImagePreviewDto;

        // Act
        component.handleImagePreviewNotification(imagePreviewDto);

        // Assert
        expect(
            signalrHandlerService.handleImagePreviewNotification,
        ).toHaveBeenCalledTimes(1);

        // Assert
        expect(
            signalrHandlerService.handleImagePreviewNotification,
        ).toHaveBeenCalledWith(imagePreviewDto, undefined);
    });
});
