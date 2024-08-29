import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { ElementRef } from '@angular/core';
import { ChatHeaderStubComponent } from '../chat-header/chat-header.component.stub';
import { MessageStubComponent } from '../message/message.component.stub';
import { SendMessageStubComponent } from '../send-message/send-message.component.stub';
import { VisibleOnlyPipe } from 'src/app/pipes/visibleOnly';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let store: jasmine.SpyObj<Store>;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;

    beforeEach(async () => {
        store = jasmine.createSpyObj('Store', ['select']);
        store.select.and.returnValue(of([]));
        apiService = jasmine.createSpyObj('ApiService', ['getMessages']);
        storeService = jasmine.createSpyObj('StoreService', [
            'initMessages',
            'addMessages',
            'setLastMessageInfo',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'isFake',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                ChatComponent,
                ChatHeaderStubComponent,
                MessageStubComponent,
                SendMessageStubComponent,
                VisibleOnlyPipe,
            ],
            providers: [
                { provide: Store, useValue: store },
                { provide: ApiService, useValue: apiService },
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load more messages when scrolled to the top', async () => {
        // Arrange
        apiService.getMessages.and.returnValue(Promise.resolve([]));
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const loadMessagesSpy = spyOn<any>(
            component,
            'loadMessages',
        ).and.callThrough();

        component['isMessageListLoaded'] = true;
        component.scrollFrame = {
            nativeElement: {
                scrollTop: 0,
            },
        } as ElementRef;

        // Act
        await component.onScroll();

        // Assert
        expect(loadMessagesSpy).toHaveBeenCalled();
        expect(component['pageIndex']).toBe(0);
        expect(component['scrollCounter']).toBe(1);
    });
});
