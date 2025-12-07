import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListTopPanelComponent } from './chat-list-top-panel.component';
import { StoreService } from 'src/app/services/store.service';
import { BackButtonStubComponent } from '../../../shared/back-button/back-button.component.stub';
import { AvatarStubComponent } from '../../../shared/avatar/avatar.component.stub';
import { LogoutButtonStubComponent } from '../logout-button/logout-button.component.stub';
import { UserDetailsStubComponent } from '../../../shared/user-details/user-details.component.stub';
import { By } from '@angular/platform-browser';
import { ImageDto } from 'src/app/api-client/api-client';

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
            ],
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
});
