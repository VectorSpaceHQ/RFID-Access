import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Log {
  _id: string;
  date: string;
  uuid_bin: string;
  member: string;
  resource: string;
  granted: boolean;
  reason?: string;
  _etag: string;
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
  constructor(private http: HttpClient) {}

  getLogs(page: number): Observable<LogsResponse> {
    return this.http.get<LogsResponse>(`/api/logs?sort=-_created&page=${page}`);
  }

  clearLogs(): Observable<void> {
    return this.http.delete<void>('/api/logs');
  }
}
