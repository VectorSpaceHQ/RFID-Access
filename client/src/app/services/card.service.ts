import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Card {
  _id: string;
  uuid: string;
  member: string;
  resources: string[];
  _etag: string;
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

  getCard(id: string): Observable<Card> {
    return this.http.get<Card>(
      `${this.configService.getApiUrl('cards')}/${id}`
    );
  }

  saveCard(id: string, etag: string, updates: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(
      `${this.configService.getApiUrl('cards')}/${id}`,
      updates,
      {
        headers: { 'If-Match': etag },
      }
    );
  }

  removeCard(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.getApiUrl('cards')}/${id}`,
      {
        headers: { 'If-Match': etag },
      }
    );
  }
}
