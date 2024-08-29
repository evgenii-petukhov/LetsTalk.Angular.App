import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChatHeaderComponent } from './chat-header.component';
import { StoreService } from 'src/app/services/store.service';
import { ActiveArea } from 'src/app/enums/active-areas';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { AvatarStubComponent } from '../avatar/avatar.stub';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('ChatHeaderComponent', () => {
    let component: ChatHeaderComponent;
    let fixture: ComponentFixture<ChatHeaderComponent>;
    let store: jasmine.SpyObj<Store>;
    let storeService: jasmine.SpyObj<StoreService>;

    beforeEach(async () => {
        store = jasmine.createSpyObj('Store', ['select']);
        store.select.and.returnValue(
            of({
                chatName: 'Chat A',
                imageId: 'img1',
                photoUrl: 'url1',
            }),
        );
        storeService = jasmine.createSpyObj('StoreService', [
            'setLayoutSettings',
            'setSelectedChatId',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                ChatHeaderComponent,
                AvatarStubComponent,
                OrderByPipe,
            ],
            providers: [
                { provide: Store, useValue: store },
                { provide: StoreService, useValue: storeService },
            ],
            imports: [FontAwesomeModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call setLayoutSettings and setSelectedChatId on back button click', () => {
        component.onBackClicked();
        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({
            activeArea: ActiveArea.sidebar,
        });
        expect(storeService.setSelectedChatId).toHaveBeenCalledWith(null);
    });

    it('should display the chat name and pass correct urlOptions to app-avatar', () => {
        fixture.detectChanges();

        const userNameElement = fixture.debugElement.query(
            By.css('.user-name'),
        );
        expect(userNameElement.nativeElement.textContent).toContain('Chat A');

        const avatarComponent = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        );
        expect(avatarComponent).toBeTruthy();
        expect(avatarComponent.componentInstance.urlOptions).toEqual([
            'img1',
            'url1',
        ]);
    });
});
