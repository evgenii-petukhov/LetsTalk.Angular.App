import { Injectable } from '@angular/core';
import { FileUploadGrpcServiceClient } from '../protos/File_uploadServiceClientPb';
import { FileUploadRequest, FileUploadResponse } from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {

    constructor(private tokenService: TokenStorageService) { }

    upload(): Promise<FileUploadResponse> {
        const fileUploadService = new FileUploadGrpcServiceClient(environment.fileStorageServiceUrl);
        const request = new FileUploadRequest();
        request.setContent('abc');
        return fileUploadService.uploadAsync(request, {  });
    }
}
