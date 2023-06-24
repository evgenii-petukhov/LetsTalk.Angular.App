import { Injectable } from '@angular/core';
import { FileUploadGrpcEndpointClient } from '../protos/File_uploadServiceClientPb';
import { UploadImageRequest, UploadImageResponse } from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {

    constructor(private tokenService: TokenStorageService) { }

    upload(content: Uint8Array): Promise<UploadImageResponse> {
        const fileUploadService = new FileUploadGrpcEndpointClient(environment.fileStorageServiceUrl);
        const request = new UploadImageRequest();
        request.setContent(content);
        request.setImageType(UploadImageRequest.ImageType.AVATAR);
        return fileUploadService.uploadImageAsync(request, { authorization: this.tokenService.getToken() });
    }
}
