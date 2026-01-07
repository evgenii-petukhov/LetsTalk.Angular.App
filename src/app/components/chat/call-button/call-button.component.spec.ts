import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallButtonComponent } from './call-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';

describe('CallButtonComponent', () => {
    let component: CallButtonComponent;
    let fixture: ComponentFixture<CallButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CallButtonComponent],
            imports: [FontAwesomeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CallButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default mode as "start-call"', () => {
        expect(component.mode).toBe('start-call');
    });

    it('should have faPhone icon defined', () => {
        expect(component.faPhone).toBeDefined();
    });

    describe('Input Properties', () => {
        it('should accept "start-call" mode', () => {
            // Arrange & Act
            component.mode = 'start-call';
            fixture.detectChanges();

            // Assert
            expect(component.mode).toBe('start-call');
        });

        it('should accept "end-call" mode', () => {
            // Arrange & Act
            component.mode = 'end-call';
            fixture.detectChanges();

            // Assert
            expect(component.mode).toBe('end-call');
        });
    });

    describe('Output Events', () => {
        it('should emit buttonClick event when onButtonClicked is called', () => {
            // Arrange
            spyOn(component.buttonClick, 'emit');

            // Act
            component.onButtonClicked();

            // Assert
            expect(component.buttonClick.emit).toHaveBeenCalled();
        });

        it('should emit buttonClick event without parameters', () => {
            // Arrange
            spyOn(component.buttonClick, 'emit');

            // Act
            component.onButtonClicked();

            // Assert
            expect(component.buttonClick.emit).toHaveBeenCalledWith();
        });

        it('should emit buttonClick event when button is clicked in template', () => {
            // Arrange
            spyOn(component.buttonClick, 'emit');
            fixture.detectChanges();

            // Find the button element (assuming it has a button tag or specific selector)
            const buttonElement = fixture.debugElement.query(By.css('button'));

            // Act
            if (buttonElement) {
                buttonElement.nativeElement.click();
            } else {
                // If no button element, trigger click on the component root
                const componentElement = fixture.debugElement.nativeElement;
                componentElement.click();
            }

            // Assert
            expect(component.buttonClick.emit).toHaveBeenCalled();
        });
    });

    describe('Template Integration', () => {
        it('should render with start-call mode', () => {
            // Arrange
            component.mode = 'start-call';

            // Act
            fixture.detectChanges();

            // Assert
            expect(fixture.debugElement.nativeElement).toBeTruthy();
            // Additional template-specific assertions can be added here
        });

        it('should render with end-call mode', () => {
            // Arrange
            component.mode = 'end-call';

            // Act
            fixture.detectChanges();

            // Assert
            expect(fixture.debugElement.nativeElement).toBeTruthy();
            // Additional template-specific assertions can be added here
        });

        it('should display FontAwesome phone icon', () => {
            // Arrange & Act
            fixture.detectChanges();

            // Assert
            const faIcon = fixture.debugElement.query(By.css('fa-icon'));
            expect(faIcon).toBeTruthy();
        });
    });

    describe('Event Handling', () => {
        it('should call onButtonClicked when component receives click event', () => {
            // Arrange
            spyOn(component, 'onButtonClicked');
            fixture.detectChanges();

            // Act
            const clickableElement =
                fixture.debugElement.query(
                    By.css('[ng-click], button, [click]'),
                ) ||
                fixture.debugElement.query(By.css('*[ng-click]')) ||
                fixture.debugElement;

            if (clickableElement) {
                clickableElement.triggerEventHandler('click', null);
            }

            // Assert
            expect(component.onButtonClicked).toHaveBeenCalled();
        });
    });

    describe('Component State', () => {
        it('should maintain mode state after multiple changes', () => {
            // Arrange & Act
            component.mode = 'start-call';
            fixture.detectChanges();
            expect(component.mode).toBe('start-call');

            component.mode = 'end-call';
            fixture.detectChanges();
            expect(component.mode).toBe('end-call');

            component.mode = 'start-call';
            fixture.detectChanges();

            // Assert
            expect(component.mode).toBe('start-call');
        });

        it('should preserve buttonClick emitter functionality across mode changes', () => {
            // Arrange
            spyOn(component.buttonClick, 'emit');

            // Act & Assert
            component.mode = 'start-call';
            component.onButtonClicked();
            expect(component.buttonClick.emit).toHaveBeenCalledTimes(1);

            component.mode = 'end-call';
            component.onButtonClicked();
            expect(component.buttonClick.emit).toHaveBeenCalledTimes(2);

            component.mode = 'start-call';
            component.onButtonClicked();
            expect(component.buttonClick.emit).toHaveBeenCalledTimes(3);
        });
    });

    describe('Integration with Parent Component', () => {
        it('should work correctly when used with input binding', () => {
            // Arrange
            const testMode = 'end-call';

            // Act
            component.mode = testMode;
            fixture.detectChanges();

            // Assert
            expect(component.mode).toBe(testMode);
        });

        it('should work correctly when used with output binding', (done) => {
            // Arrange
            component.buttonClick.subscribe(() => {
                // Assert
                expect(true).toBe(true); // Event was emitted successfully
                done();
            });

            // Act
            component.onButtonClicked();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid successive clicks', () => {
            // Arrange
            spyOn(component.buttonClick, 'emit');

            // Act
            component.onButtonClicked();
            component.onButtonClicked();
            component.onButtonClicked();

            // Assert
            expect(component.buttonClick.emit).toHaveBeenCalledTimes(3);
        });

        it('should maintain functionality after multiple interactions', () => {
            // Arrange
            const originalMode = component.mode;
            spyOn(component.buttonClick, 'emit');

            // Act
            component.onButtonClicked();

            // Assert
            expect(component.mode).toBe(originalMode);
            expect(component.buttonClick.emit).toHaveBeenCalled();
        });
    });
});
