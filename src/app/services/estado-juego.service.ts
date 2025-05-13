import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EstadoJuegoService {
  private salirJuegoSubject = new BehaviorSubject<boolean>(false);
  salirJuego$ = this.salirJuegoSubject.asObservable();

  solicitarSalidaJuego() {
    this.salirJuegoSubject.next(true);
  }

  resetearSalida() {
    this.salirJuegoSubject.next(false);
  }
}
