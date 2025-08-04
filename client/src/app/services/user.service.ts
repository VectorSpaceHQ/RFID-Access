import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface User {
  _id: string;
  username: string;
  admin: boolean;
  _etag: string;
  removing?: boolean;
}

export interface UsersResponse {
  _items: User[];
  _meta: {
    max_results: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getUsers(page: number): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(
      `${this.configService.getApiUrl('users')}?page=${page}`
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(
      `${this.configService.getApiUrl('users')}/${id}`
    );
  }

  addUser(newUser: Partial<User>): Observable<User> {
    return this.http.post<User>(this.configService.getApiUrl('users'), newUser);
  }

  saveUser(id: string, etag: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(
      `${this.configService.getApiUrl('users')}/${id}`,
      updates,
      {
        headers: { 'If-Match': etag },
      }
    );
  }

  removeUser(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.getApiUrl('users')}/${id}`,
      {
        headers: { 'If-Match': etag },
      }
    );
  }
}
