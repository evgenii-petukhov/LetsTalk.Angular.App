//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.18.2.0 (NJsonSchema v10.8.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class ApiClient {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
    }

    /**
     * @return Success
     */
    account(): Observable<AccountDto[]> {
        let url_ = this.baseUrl + "/api/Account";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "text/plain"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processAccount(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processAccount(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<AccountDto[]>;
                }
            } else
                return _observableThrow(response_) as any as Observable<AccountDto[]>;
        }));
    }

    protected processAccount(response: HttpResponseBase): Observable<AccountDto[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(AccountDto.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @return Success
     */
    me(): Observable<AccountDto> {
        let url_ = this.baseUrl + "/api/Account/Me";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "text/plain"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processMe(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processMe(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<AccountDto>;
                }
            } else
                return _observableThrow(response_) as any as Observable<AccountDto>;
        }));
    }

    protected processMe(response: HttpResponseBase): Observable<AccountDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = AccountDto.fromJS(resultData200);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    login(body: LoginRequest | undefined): Observable<LoginResponseDto> {
        let url_ = this.baseUrl + "/api/Authentication/login";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ : any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                "Accept": "text/plain"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processLogin(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processLogin(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<LoginResponseDto>;
                }
            } else
                return _observableThrow(response_) as any as Observable<LoginResponseDto>;
        }));
    }

    protected processLogin(response: HttpResponseBase): Observable<LoginResponseDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = LoginResponseDto.fromJS(resultData200);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @param recipientId (optional) 
     * @return Success
     */
    messageAll(recipientId: number | undefined): Observable<MessageDto[]> {
        let url_ = this.baseUrl + "/api/Message?";
        if (recipientId === null)
            throw new Error("The parameter 'recipientId' cannot be null.");
        else if (recipientId !== undefined)
            url_ += "recipientId=" + encodeURIComponent("" + recipientId) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "text/plain"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processMessageAll(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processMessageAll(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<MessageDto[]>;
                }
            } else
                return _observableThrow(response_) as any as Observable<MessageDto[]>;
        }));
    }

    protected processMessageAll(response: HttpResponseBase): Observable<MessageDto[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(MessageDto.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    message(body: CreateMessageRequest | undefined): Observable<MessageDto> {
        let url_ = this.baseUrl + "/api/Message";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ : any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                "Accept": "text/plain"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processMessage(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processMessage(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<MessageDto>;
                }
            } else
                return _observableThrow(response_) as any as Observable<MessageDto>;
        }));
    }

    protected processMessage(response: HttpResponseBase): Observable<MessageDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = MessageDto.fromJS(resultData200);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    markAsRead(body: MarkAsReadRequest | undefined): Observable<void> {
        let url_ = this.baseUrl + "/api/Message/MarkAsRead";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ : any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
            })
        };

        return this.http.request("put", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processMarkAsRead(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processMarkAsRead(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<void>;
                }
            } else
                return _observableThrow(response_) as any as Observable<void>;
        }));
    }

    protected processMarkAsRead(response: HttpResponseBase): Observable<void> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return _observableOf(null as any);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }
}

export class AccountDto implements IAccountDto {
    id?: number;
    accountTypeId?: number;
    photoUrl?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    unreadCount?: number;
    lastMessageDate?: number | undefined;

    constructor(data?: IAccountDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.accountTypeId = _data["accountTypeId"];
            this.photoUrl = _data["photoUrl"];
            this.firstName = _data["firstName"];
            this.lastName = _data["lastName"];
            this.unreadCount = _data["unreadCount"];
            this.lastMessageDate = _data["lastMessageDate"];
        }
    }

    static fromJS(data: any): AccountDto {
        data = typeof data === 'object' ? data : {};
        let result = new AccountDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["accountTypeId"] = this.accountTypeId;
        data["photoUrl"] = this.photoUrl;
        data["firstName"] = this.firstName;
        data["lastName"] = this.lastName;
        data["unreadCount"] = this.unreadCount;
        data["lastMessageDate"] = this.lastMessageDate;
        return data;
    }
}

export interface IAccountDto {
    id?: number;
    accountTypeId?: number;
    photoUrl?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    unreadCount?: number;
    lastMessageDate?: number | undefined;
}

export class CreateMessageRequest implements ICreateMessageRequest {
    text?: string | undefined;
    recipientId?: number;

    constructor(data?: ICreateMessageRequest) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.text = _data["text"];
            this.recipientId = _data["recipientId"];
        }
    }

    static fromJS(data: any): CreateMessageRequest {
        data = typeof data === 'object' ? data : {};
        let result = new CreateMessageRequest();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["text"] = this.text;
        data["recipientId"] = this.recipientId;
        return data;
    }
}

export interface ICreateMessageRequest {
    text?: string | undefined;
    recipientId?: number;
}

export class LoginRequest implements ILoginRequest {
    provider?: string | undefined;
    id?: string | undefined;
    authToken?: string | undefined;

    constructor(data?: ILoginRequest) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.provider = _data["provider"];
            this.id = _data["id"];
            this.authToken = _data["authToken"];
        }
    }

    static fromJS(data: any): LoginRequest {
        data = typeof data === 'object' ? data : {};
        let result = new LoginRequest();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["provider"] = this.provider;
        data["id"] = this.id;
        data["authToken"] = this.authToken;
        return data;
    }
}

export interface ILoginRequest {
    provider?: string | undefined;
    id?: string | undefined;
    authToken?: string | undefined;
}

export class LoginResponseDto implements ILoginResponseDto {
    success?: boolean;
    token?: string | undefined;

    constructor(data?: ILoginResponseDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.success = _data["success"];
            this.token = _data["token"];
        }
    }

    static fromJS(data: any): LoginResponseDto {
        data = typeof data === 'object' ? data : {};
        let result = new LoginResponseDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["success"] = this.success;
        data["token"] = this.token;
        return data;
    }
}

export interface ILoginResponseDto {
    success?: boolean;
    token?: string | undefined;
}

export class MarkAsReadRequest implements IMarkAsReadRequest {
    messageId?: number;

    constructor(data?: IMarkAsReadRequest) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.messageId = _data["messageId"];
        }
    }

    static fromJS(data: any): MarkAsReadRequest {
        data = typeof data === 'object' ? data : {};
        let result = new MarkAsReadRequest();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["messageId"] = this.messageId;
        return data;
    }
}

export interface IMarkAsReadRequest {
    messageId?: number;
}

export class MessageDto implements IMessageDto {
    id?: number;
    text?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: number;

    constructor(data?: IMessageDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.text = _data["text"];
            this.accountId = _data["accountId"];
            this.isMine = _data["isMine"];
            this.created = _data["created"];
        }
    }

    static fromJS(data: any): MessageDto {
        data = typeof data === 'object' ? data : {};
        let result = new MessageDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["text"] = this.text;
        data["accountId"] = this.accountId;
        data["isMine"] = this.isMine;
        data["created"] = this.created;
        return data;
    }
}

export interface IMessageDto {
    id?: number;
    text?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: number;
}

export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
    if (result !== null && result !== undefined)
        return _observableThrow(result);
    else
        return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next("");
            observer.complete();
        } else {
            let reader = new FileReader();
            reader.onload = event => {
                observer.next((event.target as any).result);
                observer.complete();
            };
            reader.readAsText(blob);
        }
    });
}