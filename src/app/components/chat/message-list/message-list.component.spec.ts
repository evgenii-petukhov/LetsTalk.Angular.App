/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    tick,
} from '@angular/core/testing';
import { MessageListComponent } from './message-list.component';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { ApiService } from '../../../services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ChatHeaderStubComponent } from '../chat-header/chat-header.component.stub';
import { MessageStubComponent } from '../message/message.component.stub';
import { SendMessageStubComponent } from '../compose-area/compose-area.component.stub';
import { VisibleOnlyPipe } from 'src/app/pipes/visibleOnly';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectSelectedChatId } from 'src/app/state/selected-chat/selected-chat-id.selectors';
import { Message } from 'src/app/models/message';
import { selectMessages } from 'src/app/state/messages/messages.selector';
import { By } from '@angular/platform-browser';
import { IMessageDto, ProblemDetails } from 'src/app/api-client/api-client';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { MessageListStatus } from 'src/app/models/message-list-status';
import { ApiException } from 'src/app/api-client/api-client';
import { ElementRef } from '@angular/core';

describe('MessageListComponent', () => {
    let component: MessageListComponent;
    let fixture: ComponentFixture<MessageListComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let mockSelectSelectedChatId: MemoizedSelector<
        object,
        string,
        DefaultProjectorFn<string>
    >;
    let mockSelectMessages: MemoizedSelector<
        object,
        readonly Message[],
        DefaultProjectorFn<readonly Message[]>
    >;
    let mockSelectChats: any;

    beforeEach(async () => {
        apiService = jasmine.createSpyObj('ApiService', ['getMessages']);
        storeService = jasmine.createSpyObj('StoreService', [
            'initMessages',
            'addMessages',
            'setLastMessageInfo',
            'setSelectedChatId',
            'isChatIdValid',
            'setSelectedChatMessageListStatus',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                MessageListComponent,
                ChatHeaderStubComponent,
                MessageStubComponent,
                SendMessageStubComponent,
                VisibleOnlyPipe,
                OrderByPipe,
            ],
            providers: [
                provideMockStore({}),
                { provide: ApiService, useValue: apiService },
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
                {
                    provide: ActivatedRoute,
                    useValue: { firstChild: null, params: of({}) },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectMessages = store.overrideSelector(selectMessages, null);
        mockSelectSelectedChatId = store.overrideSelector(
            selectSelectedChatId,
            null,
        );
        mockSelectChats = store.overrideSelector(selectChats, []);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not render any messages when chatId is real and message list is empty', fakeAsync(() => {
        // Arrange
        storeService.markAllAsRead = jasmine.createSpy('markAllAsRead');

        const chatId = 'chatId';
        const messageDtos = [];
        mockSelectChats.setResult([{ id: chatId }]);
        mockSelectSelectedChatId.setResult(chatId);
        mockSelectMessages.setResult(messageDtos);
        apiService.getMessages.and.resolveTo(messageDtos);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).toHaveBeenCalledOnceWith(chatId, 0);
        expect(storeService.addMessages).toHaveBeenCalledOnceWith(messageDtos);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
            chatId,
            0,
            '',
        );
        expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
            MessageListStatus.Success,
        );
        const messages = fixture.debugElement.queryAll(
            By.directive(MessageStubComponent),
        );
        expect(messages.length).toBe(0);
        flush();
    }));

    it('should render messages when chatId is real and message list is not empty', fakeAsync(async () => {
        // Arrange
        const chatId = 'chatId';
        const messageDtos: IMessageDto[] = [
            {
                chatId: chatId,
                id: 'message1',
                text: 'Hi',
                textHtml: '<p>Hi</p>',
                created: 1725020117,
            },
            {
                chatId: chatId,
                id: 'message2',
                text: 'Bye',
                textHtml: '<p>Bye</p>',
                created: 1725113717,
            },
        ];
        mockSelectSelectedChatId.setResult(chatId);
        mockSelectMessages.setResult([]);
        apiService.getMessages.and.resolveTo(messageDtos);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).toHaveBeenCalledOnceWith(chatId, 0);
        expect(storeService.addMessages).toHaveBeenCalledOnceWith(messageDtos);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledOnceWith(
            chatId,
            1725113717,
            'message2',
        );
        expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
            MessageListStatus.Success,
        );

        // Act
        const messages = messageDtos.map((message) => new Message(message));
        mockSelectMessages.setResult(messages);
        store.refreshState();
        fixture.detectChanges();

        // Assert
        const messageElements = fixture.debugElement
            .queryAll(By.directive(MessageStubComponent))
            .map((element) => element.componentInstance);
        expect(messageElements.length).toBe(2);
        expect(messageElements[0].message).toBe(messages[0]);
        expect(messageElements[1].message).toBe(messages[1]);

        // Act
        await component.onScroll();
        expect(apiService.getMessages).toHaveBeenCalledWith(chatId, 1);
        expect(storeService.addMessages).toHaveBeenCalledTimes(2);
        expect(storeService.setLastMessageInfo).toHaveBeenCalledTimes(1);

        flush();
    }));

    it('should not render any messages when chatId is fake', fakeAsync(() => {
        // Arrange
        const chatId = '-1';
        mockSelectSelectedChatId.setResult(chatId);
        idGeneratorService.isFake.and.returnValue(true);

        // Act
        store.refreshState();
        fixture.detectChanges();

        tick();

        // Assert
        expect(apiService.getMessages).not.toHaveBeenCalled();
        expect(storeService.addMessages).not.toHaveBeenCalled();
        expect(storeService.setLastMessageInfo).not.toHaveBeenCalled();
        flush();
    }));

    describe('ngOnDestroy', () => {
        it('should complete unsubscribe$ subject', () => {
            // Arrange
            spyOn(component['unsubscribe$'], 'next');
            spyOn(component['unsubscribe$'], 'complete');

            // Act
            component.ngOnDestroy();

            // Assert
            expect(component['unsubscribe$'].next).toHaveBeenCalled();
            expect(component['unsubscribe$'].complete).toHaveBeenCalled();
        });
    });

    describe('isMessageVisible', () => {
        it('should return true when message has text', () => {
            // Arrange
            const message = new Message({ text: 'Hello' });

            // Act
            const result = component.isMessageVisible(message);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when message has image', () => {
            // Arrange
            const message = new Message({ image: { id: 'test-image' } });

            // Act
            const result = component.isMessageVisible(message);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when message has neither text nor image', () => {
            // Arrange
            const message = new Message({});

            // Act
            const result = component.isMessageVisible(message);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('onScroll', () => {
        beforeEach(() => {
            component['scrollFrame'] = {
                nativeElement: { scrollTop: 0 },
            } as ElementRef;
        });

        it('should load messages when scrolled to top and message list is loaded', fakeAsync(async () => {
            // Arrange
            component['isMessageListLoaded'].set(true);
            component['chatId'].set('test-chat');
            apiService.getMessages.and.resolveTo([]);

            // Act
            await component.onScroll();
            tick();

            // Assert
            expect(apiService.getMessages).toHaveBeenCalled();
        }));

        it('should not load messages when not scrolled to top', fakeAsync(async () => {
            // Arrange
            component['isMessageListLoaded'].set(true);
            component['scrollFrame'].nativeElement.scrollTop = 100;

            // Act
            await component.onScroll();
            tick();

            // Assert
            expect(apiService.getMessages).not.toHaveBeenCalled();
        }));

        it('should not load messages when message list is not loaded', fakeAsync(async () => {
            // Arrange
            component['isMessageListLoaded'].set(false);

            // Act
            await component.onScroll();
            tick();

            // Assert
            expect(apiService.getMessages).not.toHaveBeenCalled();
        }));
    });

    describe('loadMessages with null chatId', () => {
        it('should set isMessageListLoaded to true when chatId is null', fakeAsync(() => {
            // Arrange
            component['chatId'].set(null);
            component['isMessageListLoaded'].set(false);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(component['isMessageListLoaded']()).toBe(true);
            expect(apiService.getMessages).not.toHaveBeenCalled();
        }));
    });

    describe('loadMessages with fake chatId', () => {
        it('should set Success status when fake chatId is valid', fakeAsync(() => {
            // Arrange
            const chatId = 'fake-chat-id';
            component['chatId'].set(chatId);
            idGeneratorService.isFake.and.returnValue(true);
            storeService.isChatIdValid.and.resolveTo(true);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.isChatIdValid).toHaveBeenCalledWith(chatId);
            expect(component['isMessageListLoaded']()).toBe(true);
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.Success,
            );
        }));

        it('should set NotFound status when fake chatId is invalid', fakeAsync(() => {
            // Arrange
            const chatId = 'fake-chat-id';
            component['chatId'].set(chatId);
            idGeneratorService.isFake.and.returnValue(true);
            storeService.isChatIdValid.and.resolveTo(false);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.isChatIdValid).toHaveBeenCalledWith(chatId);
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.NotFound,
            );
        }));
    });

    describe('loadMessages with API errors', () => {
        beforeEach(() => {
            component['scrollContainer'] = {
                scrollHeight: 100,
            } as HTMLDivElement;
        });

        it('should set NotFound status when API returns 404', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            idGeneratorService.isFake.and.returnValue(false);
            const apiError = new ProblemDetails({ status: 404 });
            apiService.getMessages.and.rejectWith(apiError);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.NotFound,
            );
        }));

        it('should set Error status when API returns other error', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            idGeneratorService.isFake.and.returnValue(false);
            const apiError = new ApiException(
                'Server error',
                500,
                '',
                null,
                null,
            );
            apiService.getMessages.and.rejectWith(apiError);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.Error,
            );
        }));

        it('should set Error status when non-API error occurs', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            idGeneratorService.isFake.and.returnValue(false);
            apiService.getMessages.and.rejectWith(new Error('Network error'));

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.Error,
            );
        }));
    });

    describe('loadMessages pagination', () => {
        beforeEach(() => {
            component['scrollContainer'] = {
                scrollHeight: 100,
            } as HTMLDivElement;
            component['pageIndex'].set(0);
            component['scrollCounter'] = 0;
            component['isMessageListLoaded'].set(false);
        });

        it('should increment pageIndex when messages are returned', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['pageIndex'].set(0);
            component['isMessageListLoaded'].set(true); // Set to true to avoid status emission
            idGeneratorService.isFake.and.returnValue(false);
            const messageDtos = [
                { id: 'msg1', text: 'Hello', created: 123456 },
            ];
            apiService.getMessages.and.resolveTo(messageDtos);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(component['pageIndex']()).toBe(1);
        }));

        it('should not increment pageIndex when no messages are returned', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            idGeneratorService.isFake.and.returnValue(false);

            // Mock to return empty array on subsequent calls
            const emptyMessages: any[] = [];
            apiService.getMessages.and.returnValues(
                Promise.resolve([
                    { id: 'initial', text: 'initial', created: 123 },
                ]), // First call (initial load)
                Promise.resolve(emptyMessages), // Second call (pagination)
            );

            // Set up initial state through store
            mockSelectSelectedChatId.setResult(chatId);
            mockSelectMessages.setResult([]);

            // Act - trigger initial load
            store.refreshState();
            fixture.detectChanges();
            tick();

            // Reset pageIndex to test pagination behavior
            const initialPageIndex = component['pageIndex'](); // Should be 1 after initial load

            // Act - call loadMessages again (simulating pagination)
            component['loadMessages']();
            tick();

            // Assert
            expect(component['pageIndex']()).toBe(initialPageIndex); // Should not increment when no messages
        }));
    });

    describe('scrollToBottom', () => {
        beforeEach(() => {
            const scrollSpy = jasmine.createSpy('scroll');
            component['scrollContainer'] = {
                get scrollHeight() {
                    return 200;
                },
                scroll: scrollSpy,
            } as any;
        });

        it('should scroll to bottom when scrollCounter is 0', () => {
            // Arrange
            component['scrollCounter'] = 0;

            // Act
            component['scrollToBottom']();

            // Assert
            expect(component['scrollContainer'].scroll).toHaveBeenCalled();
            const callArgs = (
                component['scrollContainer'].scroll as jasmine.Spy
            ).calls.mostRecent().args[0];
            expect(callArgs.top).toBe(200);
            expect(callArgs.left).toBe(0);
            expect(callArgs.behavior).toBe('auto');
        });

        it('should scroll by difference when scrollCounter > 0', () => {
            // Arrange
            component['scrollCounter'] = 1;
            component['previousScrollHeight'] = 100;

            // Act
            component['scrollToBottom']();

            // Assert
            expect(component['scrollContainer'].scroll).toHaveBeenCalled();
            const callArgs = (
                component['scrollContainer'].scroll as jasmine.Spy
            ).calls.mostRecent().args[0];
            expect(callArgs.top).toBe(100); // 200 - 100
            expect(callArgs.left).toBe(0);
            expect(callArgs.behavior).toBe('auto');
        });

        it('should not scroll when scrollHeight is 0', () => {
            // Arrange
            component['scrollCounter'] = 0;
            const scrollSpy = jasmine.createSpy('scroll');
            component['scrollContainer'] = {
                get scrollHeight() {
                    return 0;
                },
                scroll: scrollSpy,
            } as any;

            // Act
            component['scrollToBottom']();

            // Assert
            expect(scrollSpy).not.toHaveBeenCalled();
        });

        it('should decrease scroll counter after scrolling', () => {
            // Arrange
            component['scrollCounter'] = 2;

            // Act
            component['scrollToBottom']();

            // Assert
            expect(component['scrollCounter']).toBe(1);
        });
    });

    describe('decreaseScrollCounter', () => {
        it('should decrease positive scroll counter by 1', () => {
            // Arrange
            component['scrollCounter'] = 3;

            // Act
            component['decreaseScrollCounter']();

            // Assert
            expect(component['scrollCounter']).toBe(2);
        });

        it('should keep zero scroll counter at 0', () => {
            // Arrange
            component['scrollCounter'] = 0;

            // Act
            component['decreaseScrollCounter']();

            // Assert
            expect(component['scrollCounter']).toBe(0);
        });

        it('should keep negative scroll counter unchanged', () => {
            // Arrange
            component['scrollCounter'] = -1;

            // Act
            component['decreaseScrollCounter']();

            // Assert
            expect(component['scrollCounter']).toBe(-1); // 0 + (-1) = -1
        });
    });

    describe('ngAfterViewInit', () => {
        it('should set scrollContainer and subscribe to itemElements changes', () => {
            // Arrange
            const mockElement = document.createElement('div');
            component.scrollFrame = {
                nativeElement: mockElement,
            } as ElementRef;
            component.itemElements = {
                changes: of([]),
            } as any;

            // Act
            component.ngAfterViewInit();

            // Assert
            expect(component['scrollContainer']).toBe(mockElement);
        });
    });

    describe('chat selection changes', () => {
        it('should reset state when chat selection changes', fakeAsync(() => {
            // Arrange
            const newChatId = 'new-chat-id';
            mockSelectSelectedChatId.setResult(newChatId);
            apiService.getMessages.and.resolveTo([]);

            // Act
            store.refreshState();
            fixture.detectChanges();
            tick();

            // Assert
            expect(component['chatId']()).toBe(newChatId);
            expect(component['pageIndex']()).toBe(0);
            expect(component['scrollCounter']).toBe(0);
            expect(component['isMessageListLoaded']()).toBe(true);
            expect(storeService.initMessages).toHaveBeenCalledWith([]);
        }));
    });

    describe('ngOnInit', () => {
        it('should subscribe to selectedChatId and messages selectors', () => {
            // Arrange
            spyOn(store, 'select').and.callThrough();

            // Act
            component.ngOnInit();

            // Assert
            expect(store.select).toHaveBeenCalledWith(selectSelectedChatId);
            expect(store.select).toHaveBeenCalledWith(selectMessages);
        });

        it('should initialize component state when selectedChatId changes', fakeAsync(() => {
            // Arrange
            const chatId = 'test-chat-id';
            mockSelectSelectedChatId.setResult(chatId);
            apiService.getMessages.and.resolveTo([]);

            // Act
            component.ngOnInit();
            store.refreshState();
            tick();

            // Assert
            expect(component['chatId']()).toBe(chatId);
            expect(component['pageIndex']()).toBe(0);
            expect(component['scrollCounter']).toBe(0);
            expect(component['isMessageListLoaded']()).toBe(true);
            expect(storeService.initMessages).toHaveBeenCalledWith([]);
        }));

        it('should update messages when messages selector changes', fakeAsync(() => {
            // Arrange
            const messages = [
                new Message({ id: '1', text: 'Hello' }),
                new Message({ id: '2', text: 'World' })
            ];
            mockSelectMessages.setResult(messages);

            // Act
            component.ngOnInit();
            store.refreshState();
            tick();

            // Assert
            expect(component.messages()).toEqual(messages);
        }));
    });

    describe('loadMessages with successful API response', () => {
        beforeEach(() => {
            component['scrollContainer'] = {
                scrollHeight: 100,
            } as HTMLDivElement;
        });

        it('should set Success status on initial successful load', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['isMessageListLoaded'].set(false);
            idGeneratorService.isFake.and.returnValue(false);
            const messageDtos = [
                { id: 'msg1', text: 'Hello', created: 123456 },
                { id: 'msg2', text: 'World', created: 123457 }
            ];
            apiService.getMessages.and.resolveTo(messageDtos);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.Success,
            );
            expect(component['isMessageListLoaded']()).toBe(true);
        }));

        it('should not set status on pagination load', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['isMessageListLoaded'].set(true); // Already loaded
            idGeneratorService.isFake.and.returnValue(false);
            const messageDtos = [
                { id: 'msg3', text: 'More', created: 123458 }
            ];
            apiService.getMessages.and.resolveTo(messageDtos);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setSelectedChatMessageListStatus).not.toHaveBeenCalled();
        }));

        it('should calculate lastMessageInfo correctly', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['isMessageListLoaded'].set(false);
            idGeneratorService.isFake.and.returnValue(false);
            const messageDtos = [
                { id: 'msg1', text: 'Hello', created: 123456 },
                { id: 'msg2', text: 'World', created: 123459 },
                { id: 'msg3', text: 'Latest', created: 123458 }
            ];
            apiService.getMessages.and.resolveTo(messageDtos);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                chatId,
                123459, // Max created timestamp
                'msg2'  // ID of message with max timestamp
            );
        }));

        it('should handle empty message response on initial load', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['isMessageListLoaded'].set(false);
            idGeneratorService.isFake.and.returnValue(false);
            apiService.getMessages.and.resolveTo([]);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                chatId,
                0,
                ''
            );
            expect(storeService.setSelectedChatMessageListStatus).toHaveBeenCalledWith(
                MessageListStatus.Success,
            );
        }));
    });

    describe('scrollSequencePromise', () => {
        it('should call scrollToBottom when itemElements change', fakeAsync(() => {
            // Arrange
            const mockElement = document.createElement('div');
            component.scrollFrame = {
                nativeElement: mockElement,
            } as ElementRef;
            
            component['scrollContainer'] = {
                get scrollHeight() {
                    return 200;
                },
                scroll: jasmine.createSpy('scroll')
            } as any;

            spyOn<any>(component, 'scrollToBottom').and.callThrough();

            const changesSubject = new Subject();
            const mockQueryList = {
                changes: changesSubject.asObservable()
            } as any;
            component.itemElements = mockQueryList;

            // Act
            component.ngAfterViewInit();
            
            // Emit a change to trigger scroll operation
            changesSubject.next([1]);
            tick(); // Allow promise to resolve

            // Assert
            expect(component['scrollToBottom']).toHaveBeenCalled();
        }));
    });

    describe('edge cases', () => {
        it('should handle undefined scrollContainer in scrollToBottom', () => {
            // Arrange
            component['scrollContainer'] = undefined as any;
            component['scrollCounter'] = 0;

            // Act & Assert - Should throw because the component doesn't handle undefined scrollContainer
            expect(() => component['scrollToBottom']()).toThrowError();
        });

        it('should handle null chatId in loadMessages', fakeAsync(() => {
            // Arrange
            component['chatId'].set(null);
            component['isMessageListLoaded'].set(false);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(component['isMessageListLoaded']()).toBe(true);
            expect(apiService.getMessages).not.toHaveBeenCalled();
            expect(storeService.setSelectedChatMessageListStatus).not.toHaveBeenCalled();
        }));

        it('should handle messages with same timestamp in lastMessageInfo calculation', fakeAsync(() => {
            // Arrange
            const chatId = 'real-chat-id';
            component['chatId'].set(chatId);
            component['isMessageListLoaded'].set(false);
            idGeneratorService.isFake.and.returnValue(false);
            const messageDtos = [
                { id: 'msg1', text: 'Hello', created: 123456 },
                { id: 'msg2', text: 'World', created: 123456 }, // Same timestamp
            ];
            apiService.getMessages.and.resolveTo(messageDtos);

            // Act
            component['loadMessages']();
            tick();

            // Assert
            expect(storeService.setLastMessageInfo).toHaveBeenCalledWith(
                chatId,
                123456,
                jasmine.any(String) // Should be one of the message IDs
            );
        }));
    });

    describe('component lifecycle', () => {
        it('should properly clean up subscriptions on destroy', () => {
            // Arrange
            const unsubscribeSpy = spyOn(component['unsubscribe$'], 'next');
            const completeSpy = spyOn(component['unsubscribe$'], 'complete');

            // Act
            component.ngOnDestroy();

            // Assert
            expect(unsubscribeSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });

        it('should initialize with default values', () => {
            // Assert
            expect(component.messages()).toEqual([]);
            expect(component['pageIndex']()).toBe(0);
            expect(component['scrollCounter']).toBe(0);
            expect(component['isMessageListLoaded']()).toBe(false);
            expect(component['previousScrollHeight']).toBe(0);
        });
    });
});
