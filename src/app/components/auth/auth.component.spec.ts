import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { SocialMediaIconStubComponent } from '../social-media-icon/social-media-icon.component.stub';

describe('AuthComponent', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AuthComponent,
                SocialMediaIconStubComponent
            ],
            imports: [FontAwesomeModule, RouterTestingModule],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a link to the privacy policy with correct routerLink', () => {
        const privacyLink = fixture.debugElement.queryAll(By.css('a'))
            .find(de => de.nativeElement.textContent.includes('privacy policy'));
        expect(privacyLink).toBeTruthy();
        expect(privacyLink.attributes['ng-reflect-router-link']).toEqual('/privacy-policy');
    });

    it('should have a link to email login with correct routerLink', () => {
        const emailLink = fixture.debugElement.queryAll(By.css('a.btn-outline-primary'))
            .find(de => de.nativeElement.textContent.includes('Email'));
        expect(emailLink).toBeTruthy();
        expect(emailLink.attributes['ng-reflect-router-link']).toEqual('/login-by-email');
    });
});
