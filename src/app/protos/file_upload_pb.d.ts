import * as jspb from 'google-protobuf'



export class FileUploadRequest extends jspb.Message {
  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): FileUploadRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileUploadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: FileUploadRequest): FileUploadRequest.AsObject;
  static serializeBinaryToWriter(message: FileUploadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileUploadRequest;
  static deserializeBinaryFromReader(message: FileUploadRequest, reader: jspb.BinaryReader): FileUploadRequest;
}

export namespace FileUploadRequest {
  export type AsObject = {
    content: Uint8Array | string,
  }
}

export class FileUploadResponse extends jspb.Message {
  getStatus(): boolean;
  setStatus(value: boolean): FileUploadResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileUploadResponse.AsObject;
  static toObject(includeInstance: boolean, msg: FileUploadResponse): FileUploadResponse.AsObject;
  static serializeBinaryToWriter(message: FileUploadResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileUploadResponse;
  static deserializeBinaryFromReader(message: FileUploadResponse, reader: jspb.BinaryReader): FileUploadResponse;
}

export namespace FileUploadResponse {
  export type AsObject = {
    status: boolean,
  }
}

