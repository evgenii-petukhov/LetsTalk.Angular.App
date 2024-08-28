import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialMediaIconComponent } from './social-media-icon.component';
import { AccountType } from 'src/app/enums/account-type';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { faVk, faFacebook } from '@fortawesome/free-brands-svg-icons';

describe('SocialMediaIconComponent', () => {
    let component: SocialMediaIconComponent;
    let fixture: ComponentFixture<SocialMediaIconComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SocialMediaIconComponent],
            imports: [FontAwesomeModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SocialMediaIconComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set Facebook icon and title when iconTypeId is for Facebook', () => {
        component.iconTypeId = AccountType.facebook;
        component.ngOnChanges();

        expect(component.icon).toEqual(faFacebook);
        expect(component.title).toBe('Facebook');
    });

    it('should set VK icon and title when iconTypeId is for VK', () => {
        component.iconTypeId = AccountType.vk;
        component.ngOnChanges();

        expect(component.icon).toEqual(faVk);
        expect(component.title).toBe('VK');
    });

    it('should render the correct icon in the template', () => {
        component.iconTypeId = AccountType.facebook;
        component.ngOnChanges();
        fixture.detectChanges();

        const iconElement = fixture.debugElement.query(By.css('fa-icon'));
        expect(iconElement.componentInstance.icon).toEqual(faFacebook);
    });

    it('should render the correct title in the template', () => {
        component.iconTypeId = AccountType.vk;
        component.ngOnChanges();
        fixture.detectChanges();

        const titleElement = fixture.debugElement.query(By.css('fa-icon'));
        expect(titleElement.attributes['title']).toBe('VK');
    });
});