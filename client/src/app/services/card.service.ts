import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Card {
  id: number;
  uuid: string;
  uuid_bin: string;
  member: string;
  resources: string;
  _etag: string;
  _created?: string;
  _updated?: string;
  removing?: boolean;
}

export interface CardsResponse {
  _items: Card[];
  _meta: {
    max_results: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getCards(page: number): Observable<CardsResponse> {
    return this.http.get<CardsResponse>(
      `${this.configService.getApiUrl('cards')}?page=${page}`
    );
  }

  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(
      `${this.configService.getApiUrl('cards')}/${id}`
    );
  }

  saveCard(id: number, etag: string, updates: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(
      `${this.configService.getApiUrl('cards')}/${id}`,
      updates,
      {
        headers: { 'If-Match': etag },
      }
    );
  }

  removeCard(id: number, etag: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.getApiUrl('cards')}/${id}`,
      {
        headers: { 'If-Match': etag },
      }
    );
  }
}
