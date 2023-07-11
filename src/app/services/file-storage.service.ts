import { Injectable } from '@angular/core';
import { FileUploadGrpcEndpointClient } from '../protos/File_uploadServiceClientPb';
import { DownloadImageRequest, DownloadImageResponse, ImageRoles, UploadImageRequest, UploadImageResponse } from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { Base64Service } from './base64.service';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {
    private fileUploadService = new FileUploadGrpcEndpointClient(environment.fileStorageServiceUrl);

    constructor(
        private tokenService: TokenStorageService,
        private base64Service: Base64Service) { }

    uploadBase64Image(base64: string, imageRole: ImageRoles): Promise<UploadImageResponse> {
        if (!base64) {
            return Promise.resolve(null);
        }
        const content = this.base64Service.getContent(base64);
        const blob = Buffer.from(content, 'base64');
        return this.upload(blob, imageRole);
    }

    upload(content: Uint8Array, imageRole: ImageRoles): Promise<UploadImageResponse> {
        const request = new UploadImageRequest();
        request.setContent(content);
        request.setImageRole(imageRole);
        return this.fileUploadService.uploadImageAsync(request, { authorization: this.tokenService.getToken() });
    }

    download(imageId: number): Promise<DownloadImageResponse> {
        const request = new DownloadImageRequest();
        request.setImageId(imageId);
        return this.fileUploadService.downloadImageAsync(request, { authorization: this.tokenService.getToken() });
    }
}
