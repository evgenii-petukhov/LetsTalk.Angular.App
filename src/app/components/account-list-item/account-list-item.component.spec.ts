import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListItemComponent } from './account-list-item.component';
import { IAccountDto } from 'src/app/api-client/api-client';
import { By } from '@angular/platform-browser';
import { AvatarStubComponent } from '../avatar/avatar.stub';

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
            declarations: [AccountListItemComponent, AvatarStubComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        const userName = fixture.nativeElement.querySelector('.user-name');
        expect(userName.textContent).toContain(
            `${account.firstName} ${account.lastName}`,
        );
    });
});
