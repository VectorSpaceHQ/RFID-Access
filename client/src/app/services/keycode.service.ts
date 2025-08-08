import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Keycode {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  daily_start_time: string;
  daily_end_time: string;
  resource: string;
  granted?: boolean;
  reason?: string;
  _etag: string;
  _created?: string;
  _updated?: string;
  removing?: boolean;
}

export interface KeycodesResponse {
  _items: Keycode[];
  _meta: {
    max_results: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class KeycodeService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getKeycodes(page: number): Observable<KeycodesResponse> {
    return this.http.get<KeycodesResponse>(
      `${this.configService.getApiUrl('keycodes')}?page=${page}`
    );
  }

  getKeycode(id: number): Observable<Keycode> {
    return this.http.get<Keycode>(
      `${this.configService.getApiUrl('keycodes')}/${id}`
    );
  }

  removeKeycode(id: number, etag: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.getApiUrl('keycodes')}/${id}`,
      {
        headers: { 'If-Match': etag },
      }
    );
  }
}
