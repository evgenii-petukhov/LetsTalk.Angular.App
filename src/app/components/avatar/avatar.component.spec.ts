import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { StoreService } from 'src/app/services/store.service';
import { ErrorService } from 'src/app/services/error.service';
import { errorMessages } from 'src/app/constants/errors';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    const imageId = 'image-id';
    const url = 'http://example.com/image.jpg';
    const defaultUrl = 'images/empty-avatar.svg';
    const mockImage = {
        content: 'data:image/jpeg;base64,...',
        width: 100,
        height: 100,
    };

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getImageContent',
        ]);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);

        await TestBed.configureTestingModule({
            declarations: [AvatarComponent],
            providers: [
                { provide: StoreService, useValue: storeService },
                { provide: ErrorService, useValue: errorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    [
        { value: undefined, text: 'undefined' },
        { value: null, text: 'null' },
        { value: [], text: 'empty array' },
    ].forEach(({ value, text }) => {
        it(`should display default background image if urlOptions is ${text}`, () => {
            // Arrange

            // Act
            component.urlOptions = value;
            component.ngOnChanges();
            fixture.detectChanges();

            // Assert
            expect(component.backgroundImage).toBe(`url('${defaultUrl}')`);
            expect(storeService.getImageContent).not.toHaveBeenCalled();
            expect(errorService.handleError).not.toHaveBeenCalled();
        });
    });

    it('should display background image from URL', () => {
        // Arrange

        // Act
        component.urlOptions = [url];
        component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe(
            `url('${url}'), url('${defaultUrl}')`,
        );
        expect(storeService.getImageContent).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should display background image from image ID', async () => {
        // Arrange
        storeService.getImageContent.and.returnValue(
            Promise.resolve(mockImage),
        );

        // Act
        component.urlOptions = [imageId];
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toContain(
            `url('${mockImage.content}')`,
        );
        expect(storeService.getImageContent).toHaveBeenCalledWith(imageId);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should display background image from URL and image ID', async () => {
        // Arrange
        storeService.getImageContent.and.returnValue(
            Promise.resolve(mockImage),
        );

        // Act
        component.urlOptions = [url, imageId];
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe(
            `url('${url}'), url('${defaultUrl}')`,
        );
        expect(storeService.getImageContent).not.toHaveBeenCalled();
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should display background image from image ID and URL', async () => {
        // Arrange
        storeService.getImageContent.and.returnValue(
            Promise.resolve(mockImage),
        );

        // Act
        component.urlOptions = [imageId, url];
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe(`url('${mockImage.content}')`);
        expect(storeService.getImageContent).toHaveBeenCalledWith(imageId);
        expect(errorService.handleError).not.toHaveBeenCalled();
    });

    it('should display default background image if getImageContent fails', async () => {
        // Arrange
        const imageId = 'image-id';
        const error = new Error('error');
        storeService.getImageContent.and.throwError(error);

        // Act
        component.urlOptions = [imageId];
        await component.ngOnChanges();
        fixture.detectChanges();

        // Assert
        expect(component.backgroundImage).toBe(`url('${defaultUrl}')`);
        expect(storeService.getImageContent).toHaveBeenCalledWith(imageId);
        expect(errorService.handleError).toHaveBeenCalledWith(
            error,
            errorMessages.downloadImage,
        );
    });
});
