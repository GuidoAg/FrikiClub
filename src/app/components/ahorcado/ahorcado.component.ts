import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'friki-club-ahorcado',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.scss',
})
export class AhorcadoComponent {
  vidas = signal(6);
  tiempo = signal(0);
  aciertos = signal(0);
  juegoTerminado = signal(false);
  palabra = signal<string[]>([]);
  letrasUsadas = signal<string[]>([]);
  letraActual = signal('');
  mostrarResumen = signal(false);
  palabraCorrecta = signal('');
  temporizadorId: ReturnType<typeof setInterval> | null = null;

  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  diccionario: string[] = [];

  audioWin = new Audio('assets/sounds/win.mp3');

  constructor(private http: HttpClient) {
    this.preloadImagenes();
    this.iniciarJuego();
  }

  preloadImagenes() {
    for (let i = 0; i <= 6; i++) {
      const img = new Image();
      img.src = `assets/imagenes/${i}.png`;
    }
  }

  reproducirSonido(ruta: string) {
    if (ruta === 'assets/sounds/win.mp3') {
      this.audioWin.currentTime = 0;
      this.audioWin.play();
    }
  }

  async iniciarJuego() {
    this.tiempo.set(0);
    if (this.temporizadorId) clearInterval(this.temporizadorId);

    this.temporizadorId = setInterval(() => {
      this.tiempo.update((t) => t + 1);
    }, 1000);

    const letraInicial = this.getLetraAleatoria();
    const palabras = await this.cargarPalabrasPorLetra(letraInicial);

    // Filtrar palabras por longitud según aciertos
    const aciertos = this.aciertos();
    let maxLongitud = 10;
    if (aciertos === 0) maxLongitud = 4;
    else if (aciertos === 1) maxLongitud = 5;
    else if (aciertos === 2) maxLongitud = 6;

    // Aplicar filtro de longitud
    let palabrasFiltradas = palabras.filter((p) => {
      const limpia = this.limpiarPalabra(p);
      return limpia.length >= 3 && limpia.length <= maxLongitud;
    });

    // Si no hay palabras filtradas, usar todas
    if (palabrasFiltradas.length === 0) {
      palabrasFiltradas = palabras;
    }

    const seleccionada = this.limpiarPalabra(
      this.getPalabraAleatoria(palabrasFiltradas)
    );
    this.palabraCorrecta.set(seleccionada.toUpperCase());
    this.palabra.set(
      seleccionada
        .toUpperCase()
        .split('')
        .map((_) => '_')
    );
    this.juegoTerminado.set(false);
    this.mostrarResumen.set(false);
    this.vidas.set(6);
    this.tiempo.set(0);
    this.letrasUsadas.set([]);
  }

  getLetraAleatoria(): string {
    // const letras = 'abcdefghijklmnopqrstuvwxyz';
    const letras = 'abcd';
    return letras[Math.floor(Math.random() * letras.length)];
  }

async cargarPalabrasPorLetra(letra: string): Promise<string[]> {
  const url = `assets/diccionario/${letra}.txt`;
  try {
    const contenido = await firstValueFrom(
      this.http.get(url, { responseType: 'text' })
    );
    const lineas = contenido?.split('\n') ?? [];
    return lineas.slice(1).filter((p) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+$/.test(p));
  } catch {
    return ['angular'];
  }
}

  limpiarPalabra(raw: string): string {
    return raw
      .split(',')[0]
      .split(' ')[0]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  getPalabraAleatoria(lista: string[]): string {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  seleccionarLetra(letra: string): void {
    if (this.juegoTerminado()) return;

    const usadas = this.letrasUsadas();
    if (usadas.includes(letra)) return;

    this.letrasUsadas.set([...usadas, letra]);

    const correcta = this.palabraCorrecta();
    const palabraActual = this.palabra();

    if (correcta.includes(letra)) {
      const nueva = palabraActual.map((l, i) =>
        correcta[i] === letra ? letra : l
      );
      this.palabra.set(nueva);

      if (!nueva.includes('_')) {
        this.aciertos.update((a) => a + 1);
        setTimeout(() => this.iniciarJuego(), 1000);
      }
    } else {
      this.vidas.update((v) => v - 1);
      if (this.vidas() === 0) {
        this.finalizarJuego();
      }
    }
  }

  finalizarJuego() {
    if (this.temporizadorId) clearInterval(this.temporizadorId);
    this.juegoTerminado.set(true);
    this.mostrarResumen.set(true);
    this.reproducirSonido('assets/sounds/win.mp3');
  }

  reiniciar() {
    this.aciertos.set(0);
    this.iniciarJuego();
  }

  get imagenActual(): string {
    return `assets/imagenes/${6 - this.vidas()}.png`;
  }
}
