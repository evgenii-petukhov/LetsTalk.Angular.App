import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Base64Service {

    private base64Regex = /data:image\/(?<type>(jpeg|png|gif){1});base64,([^\\"]*)/g;

    encodeToBase64(blob: any): Promise<string> {
        return new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(blob);
        });
    }

    isBase64Image(value: string): boolean {
        return !!value.match(this.base64Regex);
    }

    getBase64ImageType(value: string): string {
        for (const match of value.matchAll(this.base64Regex)) {
            return match.groups.type;
        }

        return null;
    }
}
