import { Inject, Injectable } from '@angular/core';
import { FileUploadGrpcEndpointClient } from '../protos/File_uploadServiceClientPb';
import {
    DownloadImageRequest,
    DownloadImageResponse,
    ImageRoles,
    UploadImageRequest,
    UploadImageResponse,
} from '../protos/file_upload_pb';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { GRPC_INTERCEPTORS } from '@ngx-grpc/core';
import { ImageKey } from '../models/image-key';

@Injectable({
    providedIn: 'root',
})
export class FileStorageService {
    private fileUploadService: FileUploadGrpcEndpointClient;

    constructor(
        private tokenStorageService: TokenStorageService,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(GRPC_INTERCEPTORS) interceptors: any[],
    ) {
        this.fileUploadService = new FileUploadGrpcEndpointClient(
            environment.services.fileStorage.url,
            {},
            { unaryInterceptors: interceptors },
        );
    }

    async uploadImageAsBlob(
        blob: Blob,
        imageRole: ImageRoles,
    ): Promise<UploadImageResponse> {
        const buffer = await blob.arrayBuffer();
        return await this.upload(new Uint8Array(buffer), imageRole);
    }

    upload(
        content: Uint8Array,
        imageRole: ImageRoles,
    ): Promise<UploadImageResponse> {
        const request = new UploadImageRequest();
        request.setContent(content);
        request.setImageRole(imageRole);
        return this.fileUploadService.uploadImageAsync(request, {
            authorization: this.tokenStorageService.getToken(),
        });
    }

    download(imageKey: ImageKey): Promise<DownloadImageResponse> {
        const request = new DownloadImageRequest();
        request.setImageId(imageKey.imageId);
        request.setFileStorageTypeId(imageKey.fileStorageTypeId);
        return this.fileUploadService.downloadImageAsync(request, {
            authorization: this.tokenStorageService.getToken(),
        });
    }
}
