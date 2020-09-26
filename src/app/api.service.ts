import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { Chat } from './models/chat';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  chatsUrl = 'api/chat';

  constructor(private http: HttpClient) { }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.chatsUrl);
  }
}
