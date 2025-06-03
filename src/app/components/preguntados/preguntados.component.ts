import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryService } from '../../services/country.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PuntajeService } from '../../services/puntaje.service';

interface Pais {
  nombre: string;
  bandera: string;
}

@Component({
  selector: 'friki-club-preguntados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntadosComponent implements OnInit {
  paises: Pais[] = [];
  paisesDisponibles: Pais[] = []; // lista precargada y barajada
  paisCorrecto: Pais | null = null;
  opciones: Pais[] = [];
  puntaje = 0;
  vidas = 3;
  mensaje = '';
  juegoTerminado = false;
  tiempoRestante = 10;
  respuestaCorrecta: Pais | null = null;
  respuestaSeleccionada: Pais | null = null;
  timerInterval?: ReturnType<typeof setInterval>;
  mensajeFinal = '';
  banderaCargada = false;
  esperandoRespuesta = false;

  constructor(
    private countryService: CountryService,
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private puntajeService: PuntajeService
  ) {}

  ngOnInit(): void {
    this.countryService.getAllCountries().subscribe((data) => {
      this.paises = data.filter(
        (p) => p.nombre && p.bandera && p.bandera.trim() !== ''
      );

      this.preloadBanderaImgs(this.paises);
      this.paisesDisponibles = this.shuffle([...this.paises]);
      this.siguientePregunta();
    });
  }

  preloadBanderaImgs(paises: Pais[]) {
    paises.forEach((pais) => {
      const img = new Image();
      img.src = pais.bandera;
    });
  }

  banderaCargadaHandler() {
    this.banderaCargada = true;
    this.esperandoRespuesta = true;
    this.iniciarTemporizador();
    this.cd.markForCheck();
  }

  imagenFallida() {
    console.warn('❌ Falló al cargar la imagen de:', this.paisCorrecto?.nombre);

    this.paises = this.paises.filter(
      (p) => p.nombre !== this.paisCorrecto?.nombre
    );
    this.siguientePregunta();
  }

  reiniciarJuego() {
    this.puntaje = 0;
    this.vidas = 3;
    this.juegoTerminado = false;
    this.respuestaCorrecta = null;
    this.respuestaSeleccionada = null;
    this.paisesDisponibles = this.shuffle([...this.paises]);
    this.siguientePregunta();
  }

  iniciarTemporizador() {
    this.tiempoRestante = 10;
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante === 0) {
        clearInterval(this.timerInterval);
        this.responder(null);
      }
      this.cd.markForCheck();
    }, 1000);
  }

  siguientePregunta() {
    if (this.juegoTerminado || this.paisesDisponibles.length < 4) return;

    clearInterval(this.timerInterval);
    this.respuestaCorrecta = null;
    this.respuestaSeleccionada = null;
    this.esperandoRespuesta = false;
    this.mensaje = '';
    this.banderaCargada = false;

    this.paisCorrecto = this.paisesDisponibles.pop()!;

    const opcionesSet = new Set<Pais>();
    opcionesSet.add(this.paisCorrecto);

    while (opcionesSet.size < 4) {
      const candidato =
        this.paises[Math.floor(Math.random() * this.paises.length)];
      if (candidato && candidato !== this.paisCorrecto) {
        opcionesSet.add(candidato);
      }
    }

    this.opciones = this.shuffle(Array.from(opcionesSet));
    this.cd.markForCheck();
  }

  responder(pais: Pais | null) {
    if (!this.esperandoRespuesta) return;
    this.esperandoRespuesta = false;
    clearInterval(this.timerInterval);

    this.respuestaSeleccionada = pais ?? null;
    this.respuestaCorrecta = this.paisCorrecto;

    if (pais?.nombre === this.paisCorrecto?.nombre) {
      this.puntaje++;
    } else {
      this.vidas--;
      if (this.vidas <= 0) {
        this.juegoTerminado = true;
        this.mensajeFinal = `💀 Juego terminado. Puntaje final: ${this.puntaje}`;

        const usuario = this.userService.getCurrentUser();
        if (usuario) {
          this.puntajeService.guardarPuntaje(
            usuario,
            'preguntados',
            this.puntaje
          );
        }

        this.cd.markForCheck();
        return;
      }
    }

    this.cd.markForCheck();

    setTimeout(() => {
      if (!this.juegoTerminado) {
        this.siguientePregunta();
      }
    }, 2000);
  }

  getClaseOpcion(pais: Pais): string {
    if (!this.respuestaCorrecta) return '';

    if (pais.nombre === this.respuestaCorrecta.nombre) {
      return 'correcto';
    }
    if (this.respuestaSeleccionada?.nombre === pais.nombre) {
      return 'incorrecto';
    }
    return '';
  }

  shuffle<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}
