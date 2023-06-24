import { Injectable } from '@angular/core';
import { FileUploadGrpcEndpointClient } from '../protos/File_uploadServiceClientPb';
import { DownloadImageRequest, DownloadImageResponse, UploadImageRequest, UploadImageResponse } from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {
    private fileUploadService = new FileUploadGrpcEndpointClient(environment.fileStorageServiceUrl);

    constructor(private tokenService: TokenStorageService) { }

    upload(content: Uint8Array): Promise<UploadImageResponse> {
        const request = new UploadImageRequest();
        request.setContent(content);
        request.setImageType(UploadImageRequest.ImageType.AVATAR);
        return this.fileUploadService.uploadImageAsync(request, { authorization: this.tokenService.getToken() });
    }

    download(imageId: number): Promise<DownloadImageResponse> {
        const request = new DownloadImageRequest();
        request.setImageId(imageId);
        return this.fileUploadService.downloadImageAsync(request, { authorization: this.tokenService.getToken() });
    }
}
