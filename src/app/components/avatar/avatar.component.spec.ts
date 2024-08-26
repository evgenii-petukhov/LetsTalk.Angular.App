import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { StoreService } from 'src/app/services/store.service';
import { ErrorService } from 'src/app/services/error.service';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;
    let storeService: jasmine.SpyObj<StoreService>;

    beforeEach(async () => {
        const storeServiceSpy = jasmine.createSpyObj('StoreService', ['getImageContent']);
        const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleError']);

        await TestBed.configureTestingModule({
            declarations: [AvatarComponent],
            providers: [
                { provide: StoreService, useValue: storeServiceSpy },
                { provide: ErrorService, useValue: errorServiceSpy },
            ]
        }).compileComponents();

        storeService = TestBed.inject(StoreService) as jasmine.SpyObj<StoreService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display default background image if no URL options are provided', () => {
        component.urlOptions = [];
        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.backgroundImage).toContain('url(\'images/empty-avatar.svg\')');
    });

    it('should display background image from URL', () => {
        component.urlOptions = ['http://example.com/image.jpg'];
        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.backgroundImage).toContain('url(\'http://example.com/image.jpg\')');
    });

    it('should display background image from image ID', async () => {
        const mockImage = { content: 'data:image/jpeg;base64,...', width: 100, height: 100 };
        storeService.getImageContent.and.returnValue(Promise.resolve(mockImage));

        component.urlOptions = ['image-id'];
        await component.ngOnChanges();
        fixture.detectChanges();

        expect(component.backgroundImage).toContain('url(\'data:image/jpeg;base64,...\')');
    });

    it('should display default background image if getImageContent fails', async () => {
        storeService.getImageContent.and.returnValue(Promise.reject('Error'));

        component.urlOptions = ['image-id'];
        await component.ngOnChanges();
        fixture.detectChanges();

        expect(component.backgroundImage).toContain('url(\'images/empty-avatar.svg\')');
    });
});
