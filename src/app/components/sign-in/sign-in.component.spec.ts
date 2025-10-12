import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';

describe(SignInComponent.name, () => {
    let component: SignInComponent;
    let fixture: ComponentFixture<SignInComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignInComponent],
            imports: [FontAwesomeModule, RouterTestingModule],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(SignInComponent);
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
