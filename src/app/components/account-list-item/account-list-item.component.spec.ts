import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListItemComponent } from './account-list-item.component';
import { IAccountDto } from 'src/app/api-client/api-client';
import { By } from '@angular/platform-browser';
import { AvatarStubComponent } from '../avatar/avatar.stub';

describe('AccountListItemComponent', () => {
    let component: AccountListItemComponent;
    let fixture: ComponentFixture<AccountListItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountListItemComponent, AvatarStubComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListItemComponent);
        component = fixture.componentInstance;
        component.account = {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            imageId: 'image1',
            photoUrl: 'https://example.com/photo.jpg',
        } as IAccountDto;
        fixture.detectChanges();
    });

    it('should render the avatar component with correct url options', () => {
        const avatarComponent = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        ).componentInstance as AvatarStubComponent;
        expect(avatarComponent.urlOptions).toEqual([
            'image1',
            'https://example.com/photo.jpg',
        ]);
    });
});
