import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Resource {
  _id: string;
  name: string;
  description: string;
  _etag: string;
  removing?: boolean;
}

export interface ResourcesResponse {
  _items: Resource[];
  _meta: {
    max_results: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getResources(page: number): Observable<ResourcesResponse> {
    return this.http.get<ResourcesResponse>(
      `${this.configService.getApiUrl('resources')}?page=${page}`
    );
  }

  getResource(id: string): Observable<Resource> {
    return this.http.get<Resource>(
      `${this.configService.getApiUrl('resources')}/${id}`
    );
  }

  addResource(newResource: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(
      this.configService.getApiUrl('resources'),
      newResource
    );
  }

  saveResource(
    id: string,
    etag: string,
    updates: Partial<Resource>
  ): Observable<Resource> {
    return this.http.patch<Resource>(
      `${this.configService.getApiUrl('resources')}/${id}`,
      updates,
      {
        headers: { 'If-Match': etag },
      }
    );
  }

  removeResource(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.getApiUrl('resources')}/${id}`,
      {
        headers: { 'If-Match': etag },
      }
    );
  }
}
