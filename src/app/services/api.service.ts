import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { Chat } from '../models/chat';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const LOGIN_URL = 'api/auth/login';
const CHAT_URL = 'api/chat';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post(LOGIN_URL, data, httpOptions);
  }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(CHAT_URL);
  }

}
