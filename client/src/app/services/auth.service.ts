import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';

export interface User {
  username: string;
  token: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService
  ) {
    // Check for existing session
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.configService.getAuthUrl(), {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          const user: User = {
            username,
            token: response.token,
            isAdmin: response.admin,
          };
          this.saveCredentials(user);
        })
      );
  }

  logout(): void {
    this.clearCredentials();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.isAdmin || false;
  }

  getUsername(): string {
    return this.currentUserSubject.value?.username || '';
  }

  private saveCredentials(user: User): void {
    this.currentUserSubject.next(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearCredentials(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('currentUser');
  }
}
