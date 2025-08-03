import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resource {
  _id: string;
  name: string;
  description: string;
  _etag: string;
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
  constructor(private http: HttpClient) {}

  getResources(page: number): Observable<ResourcesResponse> {
    return this.http.get<ResourcesResponse>(`/api/resources?page=${page}`);
  }

  getResource(id: string): Observable<Resource> {
    return this.http.get<Resource>(`/api/resources/${id}`);
  }

  addResource(newResource: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>('/api/resources', newResource);
  }

  saveResource(
    id: string,
    etag: string,
    updates: Partial<Resource>
  ): Observable<Resource> {
    return this.http.patch<Resource>(`/api/resources/${id}`, updates, {
      headers: { 'If-Match': etag },
    });
  }

  removeResource(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(`/api/resources/${id}`, {
      headers: { 'If-Match': etag },
    });
  }
}
