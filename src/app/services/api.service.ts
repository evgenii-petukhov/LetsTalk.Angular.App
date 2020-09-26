import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { Chat } from '../models/chat';
import { HttpClient } from '@angular/common/http';

const CHAT_URL = 'api/chat';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(CHAT_URL);
  }
}
