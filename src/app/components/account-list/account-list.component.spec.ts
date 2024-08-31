import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListComponent } from './account-list.component';
import { DefaultProjectorFn, MemoizedSelector, Store } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { AccountListItemStubComponent } from '../account-list-item/account-list-item.component.stub';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { SidebarState } from 'src/app/enums/sidebar-state';

describe('AccountListComponent', () => {
    let component: AccountListComponent;
    let fixture: ComponentFixture<AccountListComponent>;
    let store: MockStore;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;
    let mockSelectChats: MemoizedSelector<
        object,
        readonly IChatDto[],
        DefaultProjectorFn<readonly IChatDto[]>
    >;
    let mockSelectAccounts: MemoizedSelector<
        object,
        readonly IAccountDto[],
        DefaultProjectorFn<readonly IAccountDto[]>
    >;

    const account1 = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        accountTypeId: 1,
        imageId: 'img1',
    } as IAccountDto;

    const account2 = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        accountTypeId: 1,
        photoUrl: 'url1',
    } as IAccountDto;

    const chat1 = {
        id: 'chat1',
        accountIds: [account1.id, account2.id],
        accountTypeId: 1,
        chatName: 'John Doe',
        imageId: 'img1',
        isIndividual: true,
    } as IChatDto;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'initAccountStorage',
            'setSelectedChatId',
            'markAllAsRead',
            'addChat',
            'setLayoutSettings',
        ]);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
            'getNextFakeId',
        ]);
        idGeneratorService.getNextFakeId.and.returnValue(1);

        await TestBed.configureTestingModule({
            declarations: [
                AccountListComponent,
                AccountListItemStubComponent,
                OrderByPipe,
            ],
            providers: [
                provideMockStore({}),
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        mockSelectChats = store.overrideSelector(selectChats, null);
        mockSelectAccounts = store.overrideSelector(selectAccounts, null);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render two AccountListItemComponent instances with expected parameters', () => {
        // Arrange
        mockSelectAccounts.setResult([account1, account2]);

        // Act
        store.refreshState();
        fixture.detectChanges();

        // Assert
        expect(storeService.initAccountStorage).toHaveBeenCalledTimes(1);

        const accountListItems = fixture.debugElement
            .queryAll(By.directive(AccountListItemStubComponent))
            .map((element) => element.componentInstance);

        expect(accountListItems.length).toBe(2);
        expect(accountListItems[0].account).toBe(account1);
        expect(accountListItems[1].account).toBe(account2);
    });

    it('should call setSelectedChatId and markAllAsRead when onAccountSelected is called with an existing chat', async () => {
        // Arrange
        mockSelectAccounts.setResult([account1]);
        mockSelectChats.setResult([chat1]);

        // Act
        store.refreshState();
        fixture.detectChanges();
        await component.onAccountSelected(account1);

        // Assert
        expect(storeService.initAccountStorage).toHaveBeenCalledTimes(1);
        expect(storeService.setSelectedChatId).toHaveBeenCalledOnceWith(
            chat1.id,
        );
        expect(storeService.markAllAsRead).toHaveBeenCalledOnceWith(chat1);
        expect(idGeneratorService.getNextFakeId).not.toHaveBeenCalledTimes(1);
        expect(storeService.addChat).not.toHaveBeenCalledTimes(1);
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            sidebarState: SidebarState.chats,
        });
    });

    it('should create a new chat and call setSelectedChatId when onAccountSelected is called with a new account', async () => {
        // Arrange
        const newChatId = 42;
        mockSelectAccounts.setResult([account1]);
        mockSelectChats.setResult([]);
        idGeneratorService.getNextFakeId.and.returnValue(newChatId);

        // Act
        store.refreshState();
        fixture.detectChanges();
        await component.onAccountSelected(account1);

        // Assert
        expect(storeService.initAccountStorage).toHaveBeenCalledTimes(1);
        expect(storeService.markAllAsRead).not.toHaveBeenCalledTimes(1);
        expect(idGeneratorService.getNextFakeId).toHaveBeenCalledTimes(1);
        expect(storeService.addChat).toHaveBeenCalledTimes(1);
        expect(storeService.setSelectedChatId).toHaveBeenCalledOnceWith(
            newChatId.toString(),
        );
        expect(storeService.setLayoutSettings).toHaveBeenCalledOnceWith({
            sidebarState: SidebarState.chats,
        });
    });
});
