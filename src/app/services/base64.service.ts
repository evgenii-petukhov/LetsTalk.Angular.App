import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Base64Service {
    downloadAndEncodeToBase64(url: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const response = await fetch(url);
            if (response.ok && typeof response.blob === 'function') {
                const blob = await response.blob();
                if (blob && blob.type === 'image/jpeg') {
                    const reader = new FileReader();
                    reader.onload = function (e: any) {
                        resolve(e.target.result);
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            }
            reject();
        });
    }
}
