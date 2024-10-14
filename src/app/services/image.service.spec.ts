import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;

    let mockCanvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;
    let mockBlob: Blob;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ImageService],
        });
        service = TestBed.inject(ImageService);

        mockCanvas = document.createElement('canvas');
        mockContext = {
            drawImage: jasmine.createSpy('drawImage'),
        } as unknown as CanvasRenderingContext2D;

        spyOn(mockCanvas, 'getContext').and.returnValue(mockContext);

        spyOn(document, 'createElement').and.callFake((element: string) => {
            if (element === 'canvas') {
                return mockCanvas;
            }
            if (element === 'img') {
                const img = new Image();
                setTimeout(() => {
                    Object.defineProperty(img, 'width', { value: 300 });
                    Object.defineProperty(img, 'height', { value: 200 });
                    img.dispatchEvent(new Event('load'));
                }, 0);
                return img;
            }
            return document.createElement(element);
        });

        mockBlob = new Blob();
        spyOn(mockCanvas, 'toBlob').and.callFake(
            (callback: (blob: Blob) => void) => {
                callback(mockBlob);
            },
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resizeBase64Image', () => {
        it('should resize an image and return a Blob', async () => {
            // Arrange
            const base64Image = 'data:image/jpeg;base64,some-base64-data';
            const maxWidth = 100;
            const maxHeight = 100;

            // Act
            const resizedBlob = await service.resizeBase64Image(
                base64Image,
                maxWidth,
                maxHeight,
            );

            // Assert
            expect(resizedBlob).toBe(mockBlob);
            expect(mockCanvas.width).toBeLessThanOrEqual(maxWidth);
            expect(mockCanvas.height).toBeLessThanOrEqual(maxHeight);
            expect(mockContext.drawImage).toHaveBeenCalled();
            expect(mockCanvas.toBlob).toHaveBeenCalledWith(
                jasmine.any(Function),
                'image/webp',
            );
        });

        it('should maintain aspect ratio while resizing', async () => {
            // Arrange
            const base64Image = 'data:image/jpeg;base64,some-base64-data';
            const maxWidth = 150;
            const maxHeight = 100;

            // Act
            await service.resizeBase64Image(base64Image, maxWidth, maxHeight);

            // Assert
            const expectedScale = Math.min(maxWidth / 300, maxHeight / 200);
            expect(mockCanvas.width).toBe(300 * expectedScale);
            expect(mockCanvas.height).toBe(200 * expectedScale);
        });
    });
});
