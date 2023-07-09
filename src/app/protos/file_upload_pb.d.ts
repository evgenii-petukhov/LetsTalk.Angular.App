import * as jspb from 'google-protobuf'



export class UploadImageRequest extends jspb.Message {
  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): UploadImageRequest;

  getImageType(): ImageType;
  setImageType(value: ImageType): UploadImageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UploadImageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UploadImageRequest): UploadImageRequest.AsObject;
  static serializeBinaryToWriter(message: UploadImageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UploadImageRequest;
  static deserializeBinaryFromReader(message: UploadImageRequest, reader: jspb.BinaryReader): UploadImageRequest;
}

export namespace UploadImageRequest {
  export type AsObject = {
    content: Uint8Array | string,
    imageType: ImageType,
  }
}

export class UploadImageResponse extends jspb.Message {
  getImageId(): number;
  setImageId(value: number): UploadImageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UploadImageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UploadImageResponse): UploadImageResponse.AsObject;
  static serializeBinaryToWriter(message: UploadImageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UploadImageResponse;
  static deserializeBinaryFromReader(message: UploadImageResponse, reader: jspb.BinaryReader): UploadImageResponse;
}

export namespace UploadImageResponse {
  export type AsObject = {
    imageId: number,
  }
}

export class DownloadImageRequest extends jspb.Message {
  getImageId(): number;
  setImageId(value: number): DownloadImageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DownloadImageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DownloadImageRequest): DownloadImageRequest.AsObject;
  static serializeBinaryToWriter(message: DownloadImageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DownloadImageRequest;
  static deserializeBinaryFromReader(message: DownloadImageRequest, reader: jspb.BinaryReader): DownloadImageRequest;
}

export namespace DownloadImageRequest {
  export type AsObject = {
    imageId: number,
  }
}

export class DownloadImageResponse extends jspb.Message {
  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): DownloadImageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DownloadImageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DownloadImageResponse): DownloadImageResponse.AsObject;
  static serializeBinaryToWriter(message: DownloadImageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DownloadImageResponse;
  static deserializeBinaryFromReader(message: DownloadImageResponse, reader: jspb.BinaryReader): DownloadImageResponse;
}

export namespace DownloadImageResponse {
  export type AsObject = {
    content: Uint8Array | string,
  }
}

export enum ImageType { 
  UNKNOWN = 0,
  AVATAR = 1,
  MESSAGE = 2,
}
