import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { SocialMediaIconStubComponent } from '../social-media-icon/social-media-icon.component.stub';

describe('AuthComponent', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthComponent, SocialMediaIconStubComponent],
            imports: [FontAwesomeModule, RouterTestingModule],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the Email and Privacy policy links with correct URLs', () => {
        // Arrange
        const privacyLink = fixture.nativeElement.querySelector(
            '.login-privacy-policy a',
        );
        const emailLink = fixture.nativeElement.querySelector(
            'a.btn-outline-primary',
        );

        // Act
        fixture.detectChanges();

        // Assert
        expect(privacyLink).toBeTruthy();
        expect(privacyLink.attributes['ng-reflect-router-link'].value).toEqual(
            '/privacy-policy',
        );
        expect(emailLink).toBeTruthy();
        expect(emailLink.attributes['ng-reflect-router-link'].value).toEqual(
            '/login-by-email',
        );
    });
});
