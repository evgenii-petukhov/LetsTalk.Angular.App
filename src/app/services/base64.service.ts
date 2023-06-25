import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Base64Service {

    private base64Regex = /data:image\/(?<type>(jpeg|png|gif){1});base64,(?<content>[^\\"]*)/g;

    encodeToBase64(blob: File): Promise<string | ArrayBuffer | null> {
        return new Promise<string | ArrayBuffer | null>(resolve => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent) => {
                resolve((e.target as FileReader).result);
            };
            reader.readAsDataURL(blob);
        });
    }

    isBase64Image(value: string): boolean {
        return !!value.match(this.base64Regex);
    }

    getContent(base64: string): string {
        for (const match of base64.matchAll(this.base64Regex)) {
            return match.groups.content;
        }

        return null;
    }
}
