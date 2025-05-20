import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RespuestaNuevoMazo,
  RespuestaSacarCarta
} from '../models/Deck';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private baseUrl = 'https://deckofcardsapi.com/api/deck';
  private deckId = '';

  constructor(private http: HttpClient) {}

  crearMazo(): Observable<RespuestaNuevoMazo> {
    return this.http.get<RespuestaNuevoMazo>(`${this.baseUrl}/new/shuffle/?deck_count=1`);
  }

  sacarCarta(cantidad = 1): Observable<RespuestaSacarCarta> {
    return this.http.get<RespuestaSacarCarta>(
      `${this.baseUrl}/${this.deckId}/draw/?count=${cantidad}`
    );
  }

  setDeckId(id: string): void {
    this.deckId = id;
  }

  getDeckId(): string {
    return this.deckId;
  }
}
