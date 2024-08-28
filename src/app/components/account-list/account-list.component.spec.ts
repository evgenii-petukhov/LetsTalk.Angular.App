import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListComponent } from './account-list.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { OrderByPipe } from 'src/app/pipes/orderby';
import { StoreService } from 'src/app/services/store.service';
import { IdGeneratorService } from 'src/app/services/id-generator.service';
import { selectChats } from 'src/app/state/chats/chats.selector';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { IAccountDto, IChatDto } from 'src/app/api-client/api-client';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { AccountListItemStubComponent } from '../account-list-item/account-list-item.component.stub';

describe('AccountListComponent', () => {
    let component: AccountListComponent;
    let fixture: ComponentFixture<AccountListComponent>;
    let store: jasmine.SpyObj<Store>;
    let storeService: jasmine.SpyObj<StoreService>;
    let idGeneratorService: jasmine.SpyObj<IdGeneratorService>;

    const mockAccounts$ = of([
        { id: '1', firstName: 'John', lastName: 'Doe', accountTypeId: 1, imageId: 'img1', photoUrl: 'url1' } as IAccountDto
    ]);
    const mockChats$ = of([
        { id: '1', isIndividual: true, accountIds: ['1'], chatName: 'John Doe', imageId: 'img1', photoUrl: 'url1', unreadCount: 0 } as IChatDto
    ]);

    beforeEach(async () => {
        store = jasmine.createSpyObj('Store', ['select']);
        store.select.and.callFake((selector) => {
            if (selector === selectAccounts) {
                return mockAccounts$;
            } else if (selector === selectChats) {
                return mockChats$;
            }
            return of([]);
        });

        storeService = jasmine.createSpyObj('StoreService', ['initAccountStorage', 'setSelectedChatId', 'markAllAsRead', 'addChat', 'setLayoutSettings']);
        idGeneratorService = jasmine.createSpyObj('IdGeneratorService', ['getNextFakeId']);
        idGeneratorService.getNextFakeId.and.returnValue(1);

        await TestBed.configureTestingModule({
            declarations: [
                AccountListComponent,
                AccountListItemStubComponent,
                OrderByPipe
            ],
            providers: [
                { provide: Store, useValue: store },
                { provide: StoreService, useValue: storeService },
                { provide: IdGeneratorService, useValue: idGeneratorService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initAccountStorage on ngOnInit', () => {
        component.ngOnInit();
        expect(storeService.initAccountStorage).toHaveBeenCalled();
    });

    it('should call setSelectedChatId and markAllAsRead when onAccountSelected is called with an existing chat', () => {
        const mockAccount: IAccountDto = { id: '1', firstName: 'John', lastName: 'Doe', accountTypeId: 1, imageId: 'img1', photoUrl: 'url1' };
        component.onAccountSelected(mockAccount);

        expect(storeService.setSelectedChatId).toHaveBeenCalledWith('1');
        expect(storeService.markAllAsRead).toHaveBeenCalledWith({
            id: '1',
            isIndividual: true,
            accountIds: ['1'],
            chatName: 'John Doe',
            imageId: 'img1',
            photoUrl: 'url1',
            unreadCount: 0
        });
    });

    it('should create a new chat and call setSelectedChatId when onAccountSelected is called with a new account', () => {
        const mockAccount: IAccountDto = { id: '2', firstName: 'Jane', lastName: 'Smith', accountTypeId: 2, imageId: 'img2', photoUrl: 'url2' };
        component.onAccountSelected(mockAccount);

        expect(storeService.addChat).toHaveBeenCalled();
        expect(storeService.setSelectedChatId).toHaveBeenCalled();
    });

    it('should call setLayoutSettings with sidebarState.chats on onAccountSelected', () => {
        const mockAccount: IAccountDto = { id: '1', firstName: 'John', lastName: 'Doe', accountTypeId: 1, imageId: 'img1', photoUrl: 'url1' };
        component.onAccountSelected(mockAccount);

        expect(storeService.setLayoutSettings).toHaveBeenCalledWith({ sidebarState: SidebarState.chats });
    });

    it('should display account list items', () => {
        fixture.detectChanges();
        const accountListItem = fixture.debugElement.query(By.directive(AccountListItemStubComponent));
        expect(accountListItem).toBeTruthy();
    });
});
