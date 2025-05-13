import { TestBed } from '@angular/core/testing';

import { EstadoJuegoService } from './estado-juego.service';

describe('EstadoJuegoService', () => {
  let service: EstadoJuegoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoJuegoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
