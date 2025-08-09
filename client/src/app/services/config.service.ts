import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  // Use relative URLs since the backend will serve the frontend
  getApiBaseUrl(): string {
    return '';
  }

  getAuthUrl(): string {
    return '/auth';
  }

  getApiUrl(endpoint: string): string {
    return `/api/${endpoint}`;
  }
}
