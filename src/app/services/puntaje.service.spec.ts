import { TestBed } from '@angular/core/testing';

import { PuntajeService } from './puntaje.service';

describe('PuntajeService', () => {
  let service: PuntajeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuntajeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
