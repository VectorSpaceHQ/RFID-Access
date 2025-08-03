import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
  _id: string;
  cardId: string;
  description: string;
  _etag: string;
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
  constructor(private http: HttpClient) {}

  getCards(page: number): Observable<CardsResponse> {
    return this.http.get<CardsResponse>(`/api/cards?page=${page}`);
  }

  getCard(id: string): Observable<Card> {
    return this.http.get<Card>(`/api/cards/${id}`);
  }

  saveCard(id: string, etag: string, updates: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(`/api/cards/${id}`, updates, {
      headers: { 'If-Match': etag },
    });
  }

  removeCard(id: string, etag: string): Observable<void> {
    return this.http.delete<void>(`/api/cards/${id}`, {
      headers: { 'If-Match': etag },
    });
  }
}
