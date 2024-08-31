import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { StoreService } from 'src/app/services/store.service';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ILayoutSettings } from 'src/app/models/layout-settings';
import { AccountListStubComponent } from '../account-list/account-list.stub';
import { ChatListStubComponent } from '../chat-list/chat-list.stub';
import { LoggedInUserStubComponent } from '../logged-in-user/logged-in-user.stub';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let mockSelectLayoutSettings: MemoizedSelector<
        object,
        ILayoutSettings,
        DefaultProjectorFn<ILayoutSettings>
    >;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'setLayoutSettings',
        ]);
        await TestBed.configureTestingModule({
            declarations: [
                SidebarComponent,
                LoggedInUserStubComponent,
                ChatListStubComponent,
                AccountListStubComponent,
            ],
            imports: [FontAwesomeModule],
            providers: [
                provideMockStore({}),
                { provide: StoreService, useValue: storeService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;

        mockSelectLayoutSettings = store.overrideSelector(
            selectLayoutSettings,
            null,
        );

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show chat list when sidebarState is chats', () => {
        // Arrange
        mockSelectLayoutSettings.setResult({
            sidebarState: SidebarState.chats,
        });

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        expect(component.isChatListShown).toBeTrue();
        expect(component.isAccountListShown).toBeFalse();

        expect(getChatListElement()).toBeTruthy();
        expect(getNewChatButtonElement()).toBeTruthy();
        expect(getFontAwesomeIconElement()).toBeTruthy();
        expect(getAccountListElement()).toBeFalsy();
    });

    it('should show account list when sidebarState is accounts', () => {
        // Arrange
        mockSelectLayoutSettings.setResult({
            sidebarState: SidebarState.accounts,
        });

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        expect(component.isChatListShown).toBeFalse();
        expect(component.isAccountListShown).toBeTrue();

        expect(getChatListElement()).toBeFalsy();
        expect(getNewChatButtonElement()).toBeFalsy();
        expect(getFontAwesomeIconElement()).toBeFalsy();
        expect(getAccountListElement()).toBeTruthy();
    });

    it('should call setLayoutSettings with accounts when switchToAccountList is called', () => {
        // Arrange

        // Act
        component.switchToAccountList();

        // Assert
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            sidebarState: SidebarState.accounts,
        });
    });

    it('should call setLayoutSettings with chats when onBackButtonClicked is called', () => {
        // Arrange

        // Act
        component.onBackButtonClicked();

        // Assert
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            sidebarState: SidebarState.chats,
        });
    });

    it('should unsubscribe on component destruction', () => {
        // Arrange
        spyOn(component['unsubscribe$'], 'next');
        spyOn(component['unsubscribe$'], 'complete');

        // Act
        component.ngOnDestroy();

        // Assert
        expect(component['unsubscribe$'].next).toHaveBeenCalledTimes(1);
        expect(component['unsubscribe$'].complete).toHaveBeenCalledTimes(1);
    });

    function getChatListElement() {
        return fixture.nativeElement.querySelector('app-chat-list');
    }

    function getNewChatButtonElement() {
        return fixture.nativeElement.querySelector('.new-chat-button');
    }

    function getFontAwesomeIconElement() {
        return getNewChatButtonElement()?.querySelector('fa-icon');
    }

    function getAccountListElement() {
        return fixture.nativeElement.querySelector('app-account-list');
    }
});
