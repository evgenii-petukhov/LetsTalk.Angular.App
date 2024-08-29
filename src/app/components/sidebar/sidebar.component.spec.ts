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
    let mockSelectLayoutSettings: MemoizedSelector<object, ILayoutSettings, DefaultProjectorFn<ILayoutSettings>>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', ['setLayoutSettings']);
        await TestBed.configureTestingModule({
            declarations: [
                SidebarComponent,
                LoggedInUserStubComponent,
                ChatListStubComponent,
                AccountListStubComponent
            ],
            imports: [FontAwesomeModule],
            providers: [
                provideMockStore({}),
                { provide: StoreService, useValue: storeService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;

        mockSelectLayoutSettings = store.overrideSelector(selectLayoutSettings, null);
        
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show chat list when sidebarState is chats', () => {
        mockSelectLayoutSettings.setResult({ sidebarState: SidebarState.chats });

        store.refreshState();
        fixture.detectChanges();

        expect(component.isChatListShown).toBeTrue();
        expect(component.isAccountListShown).toBeFalse();

        const chatListElement = fixture.nativeElement.querySelector('app-chat-list');
        const accountListElement = fixture.nativeElement.querySelector('app-account-list');

        expect(chatListElement).toBeTruthy();
        expect(accountListElement).toBeFalsy();
    });

    it('should show account list when sidebarState is accounts', () => {
        mockSelectLayoutSettings.setResult({ sidebarState: SidebarState.accounts });

        store.refreshState();
        fixture.detectChanges();

        expect(component.isChatListShown).toBeFalse();
        expect(component.isAccountListShown).toBeTrue();

        const chatListElement = fixture.nativeElement.querySelector('app-chat-list');
        const accountListElement = fixture.nativeElement.querySelector('app-account-list');

        expect(chatListElement).toBeFalsy();
        expect(accountListElement).toBeTruthy();
    });

    it('should call setLayoutSettings with accounts when switchToAccountList is called', () => {
        component.switchToAccountList();

        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({ sidebarState: SidebarState.accounts });
    });

    it('should call setLayoutSettings with chats when onBackButtonClicked is called', () => {
        component.onBackButtonClicked();

        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({ sidebarState: SidebarState.chats });
    });

    it('should unsubscribe on component destruction', () => {
        spyOn(component['unsubscribe$'], 'next');
        spyOn(component['unsubscribe$'], 'complete');

        component.ngOnDestroy();

        expect(component['unsubscribe$'].next).toHaveBeenCalled();
        expect(component['unsubscribe$'].complete).toHaveBeenCalled();
    });
});
