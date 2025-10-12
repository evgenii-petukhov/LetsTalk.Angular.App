import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMessageButtonComponent } from './send-message-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';

describe('SendMessageButtonComponent', () => {
    let component: SendMessageButtonComponent;
    let fixture: ComponentFixture<SendMessageButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SendMessageButtonComponent],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SendMessageButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the faPaperPlane icon', () => {
        // Arrange
        const iconElement = fixture.debugElement.query(By.css('fa-icon'));

        // Act
        fixture.detectChanges();

        // Assert
        expect(iconElement).toBeTruthy();
        expect(iconElement.componentInstance.icon).toEqual(
            component.faPaperPlane,
        );
    });

    it('should emit buttonClick when the button is clicked', () => {
        // Arrange
        spyOn(component.buttonClick, 'emit');

        // Act
        const buttonElement = fixture.debugElement.query(
            By.css('button'),
        ).nativeElement;
        buttonElement.click();

        // Assert
        expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should disable the button when the disabled input is true', () => {
        // Arrange
        component.disabled = true;

        // Act
        fixture.detectChanges();

        // Assert
        const buttonElement = fixture.debugElement.query(
            By.css('button'),
        ).nativeElement;
        expect(buttonElement.disabled).toBeTrue();
    });

    it('should enable the button when the disabled input is false', () => {
        // Arrange
        component.disabled = false;

        // Act
        fixture.detectChanges();

        // Assert
        const buttonElement = fixture.debugElement.query(
            By.css('button'),
        ).nativeElement;
        expect(buttonElement.disabled).toBeFalse();
    });
});
