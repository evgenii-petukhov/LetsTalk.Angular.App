import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectImageButtonComponent } from './select-image-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';

describe('SelectImageButtonComponent', () => {
    let component: SelectImageButtonComponent;
    let fixture: ComponentFixture<SelectImageButtonComponent>;

    const file = new Blob(['dummy image content'], { type: 'image/png' });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectImageButtonComponent],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectImageButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the faCamera icon', () => {
        // Arrange
        const iconElement = fixture.debugElement.query(By.css('fa-icon'));

        // Act
        fixture.detectChanges();

        // Assert
        expect(iconElement).toBeTruthy();
        expect(iconElement.componentInstance.icon()).toEqual(component.faCamera);
    });

    it('should emit imageBlobReady when a file is selected', () => {
        // Arrange
        spyOn(component.imageBlobReady, 'emit');

        const inputElement = fixture.debugElement.query(
            By.css('input[type="file"]'),
        ).nativeElement;

        const event = new Event('change');
        Object.defineProperty(event, 'target', {
            writable: false,
            value: { files: [file] },
        });

        // Act
        inputElement.dispatchEvent(event);
        fixture.detectChanges();

        // Assert
        expect(component.imageBlobReady.emit).toHaveBeenCalledWith(file);
    });

    it('should reset input value after emitting the imageBlobReady event', () => {
        // Arrange
        const inputElement = fixture.debugElement.query(
            By.css('input[type="file"]'),
        ).nativeElement;

        const event = new Event('change');
        Object.defineProperty(event, 'target', {
            writable: false,
            value: { files: [file] },
        });

        // Act
        inputElement.dispatchEvent(event);
        fixture.detectChanges();

        // Assert
        expect(inputElement.value).toBe('');
    });
});
