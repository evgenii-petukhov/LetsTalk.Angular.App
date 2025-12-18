import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListTopPanelComponent } from './chat-list-top-panel.component';
import { StoreService } from 'src/app/services/store.service';
import { BackButtonStubComponent } from '../../../shared/back-button/back-button.component.stub';
import { AvatarStubComponent } from '../../../shared/avatar/avatar.component.stub';
import { LogoutButtonStubComponent } from '../logout-button/logout-button.component.stub';
import { UserDetailsStubComponent } from '../../../shared/user-details/user-details.component.stub';
import { By } from '@angular/platform-browser';
import { ImageDto } from 'src/app/api-client/api-client';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { BackButtonStatus } from 'src/app/models/back-button-status';

@Component({
    selector: 'app-top-panel',
    template: '<ng-content></ng-content>',
    standalone: false,
})
class TopPanelStubComponent {
    @Input() backButton: BackButtonStatus;
}

describe('ChatListTopPanelComponent', () => {
    let component: ChatListTopPanelComponent;
    let fixture: ComponentFixture<ChatListTopPanelComponent>;
    let storeService: jasmine.SpyObj<StoreService>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getLoggedInUser',
        ]);

        await TestBed.configureTestingModule({
            declarations: [
                ChatListTopPanelComponent,
                BackButtonStubComponent,
                AvatarStubComponent,
                UserDetailsStubComponent,
                LogoutButtonStubComponent,
                TopPanelStubComponent,
            ],
            imports: [RouterTestingModule],
            providers: [{ provide: StoreService, useValue: storeService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatListTopPanelComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch logged-in user on initialization', async () => {
        // Arrange
        const profile = {
            image: new ImageDto({
                id: '1',
                fileStorageTypeId: 1,
            }),
            photoUrl: 'url',
        };

        storeService.getLoggedInUser.and.resolveTo(profile);

        // Act
        await component.ngOnInit();

        // Assert
        expect(storeService.getLoggedInUser).toHaveBeenCalled();
        expect(component.account).toEqual(profile);
    });

    it('should the Avatar, UserDetails, and LogoutButton components if isNavigationActive is false', () => {
        component.isNavigationActive = false;

        fixture.detectChanges();

        const hostElement = fixture.debugElement.nativeElement;
        expect(hostElement.classList.contains('navigation-active')).toBeFalse();

        const backButton = fixture.debugElement.query(
            By.directive(BackButtonStubComponent),
        );
        expect(backButton).toBeNull();

        const avatar = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        );
        expect(avatar).toBeTruthy();

        const userDetails = fixture.debugElement.query(
            By.directive(UserDetailsStubComponent),
        );
        expect(userDetails).toBeTruthy();
        expect(userDetails.componentInstance.value).toBe('You');

        const logoutButton = fixture.debugElement.query(
            By.directive(LogoutButtonStubComponent),
        );
        expect(logoutButton).toBeTruthy();
    });

    it('should apply navigation-active CSS class when isNavigationActive is true', () => {
        // Arrange
        component.isNavigationActive = true;

        // Act
        fixture.detectChanges();

        // Assert
        const hostElement = fixture.debugElement.nativeElement;
        expect(hostElement.classList.contains('navigation-active')).toBeTrue();
    });

    it('should not apply navigation-active CSS class when isNavigationActive is false', () => {
        // Arrange
        component.isNavigationActive = false;

        // Act
        fixture.detectChanges();

        // Assert
        const hostElement = fixture.debugElement.nativeElement;
        expect(hostElement.classList.contains('navigation-active')).toBeFalse();
    });

    it('should pass correct urlOptions to avatar when account has image and photoUrl', () => {
        // Arrange
        const mockAccount = {
            image: new ImageDto({ id: '1', fileStorageTypeId: 1 }),
            photoUrl: 'test-photo-url',
        };
        component.account = mockAccount;

        // Act
        fixture.detectChanges();

        // Assert
        const avatar = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        );
        expect(avatar.componentInstance.urlOptions).toEqual([
            mockAccount.image,
            mockAccount.photoUrl,
        ]);
    });

    it('should pass null urlOptions to avatar when account is null', () => {
        // Arrange
        component.account = null;

        // Act
        fixture.detectChanges();

        // Assert
        const avatar = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        );
        expect(avatar.componentInstance.urlOptions).toBeNull();
    });

    it('should pass undefined urlOptions to avatar when account is undefined', () => {
        // Arrange
        component.account = undefined;

        // Act
        fixture.detectChanges();

        // Assert
        const avatar = fixture.debugElement.query(
            By.directive(AvatarStubComponent),
        );
        expect(avatar.componentInstance.urlOptions).toBeUndefined();
    });

    it('should call onLogoutButtonClicked method when logout button is clicked', () => {
        // Arrange
        spyOn(component, 'onLogoutButtonClicked');

        // Act
        component.onLogoutButtonClicked();

        // Assert
        expect(component.onLogoutButtonClicked).toHaveBeenCalled();
    });

    it('should trigger logout when logout button emits buttonClick event', () => {
        // Arrange
        spyOn(component, 'onLogoutButtonClicked');
        fixture.detectChanges();

        const logoutButton = fixture.debugElement.query(
            By.directive(LogoutButtonStubComponent),
        );

        // Act
        logoutButton.componentInstance.buttonClick.emit();

        // Assert
        expect(component.onLogoutButtonClicked).toHaveBeenCalled();
    });

    it('should have routerLink pointing to profile page', () => {
        // Arrange & Act
        fixture.detectChanges();

        // Assert
        const profileLink = fixture.debugElement.query(
            By.css('a[title="Edit profile"]'),
        );
        expect(profileLink).toBeTruthy();
        expect(profileLink.nativeElement.title).toBe('Edit profile');
    });

    it('should handle ngOnInit error gracefully', async () => {
        // Arrange
        const error = new Error('Service error');
        storeService.getLoggedInUser.and.rejectWith(error);
        spyOn(console, 'error'); // Prevent error from showing in test output

        // Act & Assert
        await expectAsync(component.ngOnInit()).toBeRejected();
        expect(storeService.getLoggedInUser).toHaveBeenCalled();
    });

    describe('HostBinding', () => {
        it('should bind isNavigationActive to navigation-active class', () => {
            // Arrange
            component.isNavigationActive = true;

            // Act
            fixture.detectChanges();

            // Assert
            expect(
                fixture.debugElement.nativeElement.classList.contains(
                    'navigation-active',
                ),
            ).toBeTrue();

            // Change value
            component.isNavigationActive = false;
            fixture.detectChanges();

            expect(
                fixture.debugElement.nativeElement.classList.contains(
                    'navigation-active',
                ),
            ).toBeFalse();
        });
    });

    describe('Component Integration', () => {
        it('should render all child components correctly', () => {
            // Arrange & Act
            fixture.detectChanges();

            // Assert
            const avatar = fixture.debugElement.query(
                By.directive(AvatarStubComponent),
            );
            const userDetails = fixture.debugElement.query(
                By.directive(UserDetailsStubComponent),
            );
            const logoutButton = fixture.debugElement.query(
                By.directive(LogoutButtonStubComponent),
            );

            expect(avatar).toBeTruthy();
            expect(userDetails).toBeTruthy();
            expect(logoutButton).toBeTruthy();

            // Verify UserDetails has correct value
            expect(userDetails.componentInstance.value).toBe('You');
        });

        it('should pass account data to avatar component when available', () => {
            // Arrange
            const mockAccount = {
                image: new ImageDto({ id: 'test-id', fileStorageTypeId: 2 }),
                photoUrl: 'https://example.com/photo.jpg',
            };
            component.account = mockAccount;

            // Act
            fixture.detectChanges();

            // Assert
            const avatar = fixture.debugElement.query(
                By.directive(AvatarStubComponent),
            );
            expect(avatar.componentInstance.urlOptions).toEqual([
                mockAccount.image,
                mockAccount.photoUrl,
            ]);
        });
    });
});
