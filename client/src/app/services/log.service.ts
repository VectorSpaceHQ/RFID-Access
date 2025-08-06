import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Log {
  id: number;
  uuid: string;
  uuid_bin: string;
  member: string;
  resource: string;
  granted: boolean;
  reason?: string;
  date?: string;
  _etag: string;
  _created?: string;
  _updated?: string;
}

export interface LogsResponse {
  _items: Log[];
  _meta: {
    max_results: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getLogs(page: number): Observable<LogsResponse> {
    return this.http.get<LogsResponse>(
      `${this.configService.getApiUrl('logs')}?sort=-_created&page=${page}`
    );
  }

  clearLogs(): Observable<void> {
    return this.http.delete<void>(this.configService.getApiUrl('logs'));
  }
}
