import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComponent } from './message.component';
import { Message } from 'src/app/models/message';
import { ImagePreview } from 'src/app/models/imagePreview';
import { By } from '@angular/platform-browser';
import { ImageStubComponent } from '../image/image.component.stub';

describe('MessageComponent', () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageComponent, ImageStubComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should apply "btm-right" class when message.isMine is true', () => {
        const mockMessage = new Message({ isMine: true });
        component.message = mockMessage;

        fixture.detectChanges();

        const bubbleElement = fixture.debugElement.query(By.css('.bubble'));
        expect(bubbleElement.classes['btm-right']).toBeTrue();
    });

    it('should apply "btm-left" class when message.isMine is false', () => {
        const mockMessage = new Message({ isMine: false });
        component.message = mockMessage;

        fixture.detectChanges();

        const bubbleElement = fixture.debugElement.query(By.css('.bubble'));
        expect(bubbleElement.classes['btm-left']).toBeTrue();
    });

    it('should apply "extra-padding" class when message.textHtml is present and message.isMine is false or message.linkPreview is not present', () => {
        const mockMessage = new Message({
            textHtml: '<p>Some HTML</p>',
            isMine: false,
        });
        component.message = mockMessage;

        fixture.detectChanges();

        const bubbleElement = fixture.debugElement.query(By.css('.bubble'));
        expect(bubbleElement.classes['extra-padding']).toBeTrue();
    });

    it('should not apply "extra-padding" class when message.linkPreview is present', () => {
        const mockMessage = new Message({
            linkPreview: {
                url: 'https://example.com',
                imageUrl: 'https://example.com/image.png',
                title: 'Example',
            },
        });
        component.message = mockMessage;

        fixture.detectChanges();

        const bubbleElement = fixture.debugElement.query(
            By.css('.bubble'),
        ).nativeElement;
        const hasExtraPadding =
            bubbleElement.classList.contains('extra-padding');
        expect(hasExtraPadding).toBeFalsy();
    });

    it('should display link preview with image when linkPreview.imageUrl is provided and no image error', () => {
        const mockMessage = new Message({
            linkPreview: {
                url: 'http://example.com',
                imageUrl: 'http://example.com/image.jpg',
                title: 'Example',
            },
        });
        component.message = mockMessage;

        fixture.detectChanges();

        const linkPreviewImage = fixture.debugElement.query(
            By.css('.link-preview-image img'),
        );
        expect(linkPreviewImage).toBeTruthy();
        expect(linkPreviewImage.nativeElement.src).toBe(
            'http://example.com/image.jpg',
        );
    });

    it('should not display link preview image when isImageError is true', () => {
        const mockMessage = new Message({
            linkPreview: { imageUrl: 'http://example.com/image.jpg' },
        });
        component.message = mockMessage;
        component.isImageError = true;

        fixture.detectChanges();

        const linkPreviewImage = fixture.debugElement.query(
            By.css('.link-preview-image img'),
        );
        expect(linkPreviewImage).toBeFalsy();
    });

    it('should display link preview text', () => {
        const mockMessage = new Message({
            linkPreview: { url: 'http://example.com', title: 'Example' },
        });
        component.message = mockMessage;

        fixture.detectChanges();

        const linkPreviewText = fixture.debugElement.query(
            By.css('.link-preview-text'),
        ).nativeElement;
        expect(linkPreviewText.textContent).toContain('Example');
    });

    it('should display HTML content when message.textHtml is provided', () => {
        const mockMessage = new Message({ textHtml: '<b>Bold Text</b>' });
        component.message = mockMessage;

        fixture.detectChanges();

        const contentElement = fixture.debugElement.query(
            By.css('.content'),
        ).nativeElement;
        expect(contentElement.innerHTML).toContain('<b>Bold Text</b>');
    });

    it('should display image when message.imageId is provided', () => {
        const mockMessage = new Message({
            imageId: 1,
            imagePreview: new ImagePreview({
                id: '1',
                width: 100,
                height: 100,
            }),
        });
        component.message = mockMessage;

        fixture.detectChanges();

        const imageElement = fixture.debugElement.query(By.css('app-image'));
        expect(imageElement).toBeTruthy();
    });

    it('should display time formatted as HH:mm', () => {
        const localDate = new Date(2023, 7, 23, 14, 34);
        const mockMessage = new Message({ created: localDate });
        component.message = mockMessage;

        fixture.detectChanges();

        const timeElement = fixture.debugElement.query(
            By.css('.time'),
        ).nativeElement;

        const hours = localDate.getHours().toString().padStart(2, '0');
        const minutes = localDate.getMinutes().toString().padStart(2, '0');
        const expectedTime = `${hours}:${minutes}`;

        expect(timeElement.textContent.trim()).toBe(expectedTime);
    });

    it('should set isImageError to true when onImageError is called', () => {
        component.onImageError();
        expect(component.isImageError).toBeTrue();
    });
});
