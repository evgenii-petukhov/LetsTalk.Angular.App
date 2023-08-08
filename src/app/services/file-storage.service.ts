import { Inject, Injectable } from '@angular/core';
import { FileUploadGrpcEndpointClient } from '../protos/File_uploadServiceClientPb';
import { DownloadImageRequest, DownloadImageResponse, ImageRoles, UploadImageRequest, UploadImageResponse } from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { GRPC_INTERCEPTORS } from '@ngx-grpc/core';

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {
    private fileUploadService: FileUploadGrpcEndpointClient;

    constructor(
        private tokenService: TokenStorageService,
        @Inject(GRPC_INTERCEPTORS) interceptors: any[]) {
        this.fileUploadService = new FileUploadGrpcEndpointClient(environment.services.fileStorage.url, {}, { 'unaryInterceptors': interceptors });
    }

    async uploadImageAsBlob(blob: Blob, imageRole: ImageRoles): Promise<UploadImageResponse> {
        const buffer = await blob.arrayBuffer();
        return await this.upload(new Uint8Array(buffer), imageRole);
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
