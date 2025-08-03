import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  username: string;
  admin: boolean;
  _etag: string;
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
  constructor(private http: HttpClient) {}

  getUsers(page: number): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`/api/users?page=${page}`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  addUser(newUser: Partial<User>): Observable<User> {
    return this.http.post<User>('/api/users', newUser);
  }

  saveUser(id: string, etag: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`/api/users/${id}`, updates, {
      headers: { 'If-Match': etag },
    });
  }

  removeUser(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`, {
      headers: { 'If-Match': etag },
    });
  }
}
