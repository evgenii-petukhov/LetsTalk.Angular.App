import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListItemComponent } from './account-list-item.component';
import { IAccountDto } from 'src/app/api-client/api-client';
import { By } from '@angular/platform-browser';
import { AvatarStubComponent } from '../avatar/avatar.stub';
import { UserDetailsStubComponent } from '../user-details/user-details.component.stub';

describe('AccountListItemComponent', () => {
    let component: AccountListItemComponent;
    let fixture: ComponentFixture<AccountListItemComponent>;

    const account = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        imageId: 'image1',
        photoUrl: 'https://example.com/photo.jpg',
    } as IAccountDto;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AccountListItemComponent,
                AvatarStubComponent,
                UserDetailsStubComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListItemComponent);
        component = fixture.componentInstance;
    });

    it('should render the avatar component with correct url options', () => {
        // Arrange

        // Act
        component.account = account;
        fixture.detectChanges();

        const avatarComponent = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        ).componentInstance as AvatarStubComponent;
        expect(avatarComponent.urlOptions).toEqual([
            account.imageId,
            account.photoUrl,
        ]);

        // Assert
        const userDetailsComponent = fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        ).componentInstance as UserDetailsStubComponent;
        expect(userDetailsComponent.userName).toEqual(
            `${account.firstName} ${account.lastName}`,
        );
    });

    it('should emit an event when onAccountSelected is called', () => {
        // Arrange
        spyOn(component.accountSelected, 'emit');

        // Act
        component.account = account;
        fixture.detectChanges();

        component.onAccountSelected();

        // Assert
        expect(component.accountSelected.emit).toHaveBeenCalledOnceWith(
            account,
        );
    });

    it('should emit an event when link element is clicked', () => {
        // Arrange
        spyOn(component.accountSelected, 'emit');

        // Act
        component.account = account;
        fixture.detectChanges();

        fixture.debugElement
            .query(By.css('a'))
            .triggerEventHandler('click', null);

        // Assert
        expect(component.accountSelected.emit).toHaveBeenCalledOnceWith(
            account,
        );
    });
});
