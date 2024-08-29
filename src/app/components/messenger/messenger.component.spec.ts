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
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { selectSelectedChat } from 'src/app/state/selected-chat/selected-chat.selector';
import { selectViewedImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';
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
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerComponent);
        component = fixture.componentInstance;

        store.select.and.callFake((selector) => {
            if (selector === selectChats) {
                return of([]);
            } else if (selector === selectSelectedChat) {
                return of(null);
            } else if (selector === selectLayoutSettings) {
                return of({ activeArea: ActiveArea.sidebar });
            } else if (
                selector === selectSelectedChatId ||
                selector === selectViewedImageId
            ) {
                return of(null);
            }
            return of(null);
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize chat storage and SignalR handlers on ngOnInit', async () => {
        await component.ngOnInit();
        expect(storeService.initChatStorage).toHaveBeenCalled();
        expect(signalrHandlerService.initHandlers).toHaveBeenCalled();
    });

    it('should handle visibility change event', () => {
        component['selectedChat'] = { id: 'chatId' } as IChatDto;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.onVisibilityChange({ target: document } as any);

        expect(storeService.markAllAsRead).toHaveBeenCalledWith(
            component['selectedChat'],
        );
    });

    it('should call removeHandlers on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(signalrHandlerService.removeHandlers).toHaveBeenCalled();
    });

    it('should handle message notification', () => {
        const messageDto = { chatId: 'chatId', isMine: false } as IMessageDto;
        component.handleMessageNotification(messageDto);

        expect(
            signalrHandlerService.handleMessageNotification,
        ).toHaveBeenCalledWith(messageDto, undefined, [], true);
    });

    it('should handle link preview notification', () => {
        const linkPreviewDto = { chatId: 'chatId' } as ILinkPreviewDto;
        component.handleLinkPreviewNotification(linkPreviewDto);

        expect(
            signalrHandlerService.handleLinkPreviewNotification,
        ).toHaveBeenCalledWith(linkPreviewDto, undefined);
    });

    it('should handle image preview notification', () => {
        const imagePreviewDto = { chatId: 'chatId' } as IImagePreviewDto;
        component.handleImagePreviewNotification(imagePreviewDto);

        expect(
            signalrHandlerService.handleImagePreviewNotification,
        ).toHaveBeenCalledWith(imagePreviewDto, undefined);
    });
});
