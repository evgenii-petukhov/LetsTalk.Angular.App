import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    constructor() { }

    resizeBase64Image(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
        return new Promise<string>(resolve => {
            const img = document.createElement('img');
            img.addEventListener('load', () => {
                const scaleX = img.width > maxWidth ? maxWidth / img.width : 1;
                const scaleY = img.height > maxHeight ? maxHeight / img.height : 1;
                const scale = Math.min(scaleX, scaleY);

                if (scale === 1) {
                    resolve(base64);
                    return;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL());
            });
            img.src = base64;
        });
    }
}