import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoEncuestaComponent } from './resultado-encuesta.component';

describe('ResultadoEncuestaComponent', () => {
  let component: ResultadoEncuestaComponent;
  let fixture: ComponentFixture<ResultadoEncuestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoEncuestaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoEncuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
