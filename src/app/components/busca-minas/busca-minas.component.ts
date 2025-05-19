import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

interface Celda {
  mina: boolean;
  valor: number;
  revelada: boolean;
  marcada: boolean;
}

@Component({
  selector: 'friki-club-busca-minas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './busca-minas.component.html',
  styleUrl: './busca-minas.component.scss',
})
export class BuscaMinasComponent implements OnDestroy {
  filas = 9;
  columnas = 9;
  totalMinas = 10;

  tablero = signal<Celda[][]>([]);
  tiempo = signal(0);
  minasRestantes = signal(this.totalMinas);
  juegoTerminado = signal(false);
  mensajeFinal = signal<string | null>(null);

  private temporizadorId: ReturnType<typeof setInterval> | null = null;

  private audios: Record<string, HTMLAudioElement> = {};

  constructor() {
    this.preloadAudios();
    this.iniciarJuego();
  }

  ngOnDestroy(): void {
    if (this.temporizadorId) clearInterval(this.temporizadorId);
  }

  preloadAudios() {
    const sonidos = [
      'click-busca-minas',
      'bandera-busca-minas',
      'boom-busca-minas',
      'win',
    ];
    sonidos.forEach((nombre) => {
      const audio = new Audio(`assets/sounds/${nombre}.mp3`);
      audio.load();
      this.audios[nombre] = audio;
    });
  }

  reproducirSonido(nombre: string): void {
    const audio = this.audios[nombre];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch((err) => console.error('Error sonido:', err));
    }
  }

  iniciarJuego(): void {
    this.juegoTerminado.set(false);
    this.mensajeFinal.set(null);
    this.tiempo.set(0);

    if (this.temporizadorId) clearInterval(this.temporizadorId);
    this.temporizadorId = setInterval(() => this.tiempo.update((t) => t + 1), 1000);

    const tablero: Celda[][] = Array.from({ length: this.filas }, () =>
      Array.from({ length: this.columnas }, () => ({
        mina: false,
        valor: 0,
        revelada: false,
        marcada: false,
      }))
    );

    let minasColocadas = 0;
    while (minasColocadas < this.totalMinas) {
      const i = Math.floor(Math.random() * this.filas);
      const j = Math.floor(Math.random() * this.columnas);
      if (!tablero[i][j].mina) {
        tablero[i][j].mina = true;
        minasColocadas++;
      }
    }

    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (!tablero[i][j].mina) {
          tablero[i][j].valor = this.contarMinasAdyacentes(tablero, i, j);
        }
      }
    }

    this.tablero.set(tablero);
    this.minasRestantes.set(this.totalMinas);
  }

  contarMinasAdyacentes(tablero: Celda[][], x: number, y: number): number {
    let count = 0;
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.estaEnRango(nx, ny) && tablero[nx][ny].mina) count++;
      }
    }
    return count;
  }

  estaEnRango(x: number, y: number): boolean {
    return x >= 0 && x < this.filas && y >= 0 && y < this.columnas;
  }

  descubrir(i: number, j: number): void {
    if (this.juegoTerminado()) return;

    const tablero = this.tablero();
    const celda = tablero[i][j];
    if (celda.revelada || celda.marcada) return;

    celda.revelada = true;

    if (celda.mina) {
      this.finalizarJuego(false);
    } else {
      this.reproducirSonido('click-busca-minas');
      if (celda.valor === 0) this.descubrirVecinos(tablero, i, j);
      this.verificarVictoria();
    }

    this.tablero.set([...tablero]); 
  }

  descubrirVecinos(tablero: Celda[][], x: number, y: number): void {
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        const nx = x + dx;
        const ny = y + dy;
        if (this.estaEnRango(nx, ny)) {
          const vecino = tablero[nx][ny];
          if (!vecino.revelada && !vecino.mina) {
            vecino.revelada = true;
            if (vecino.valor === 0) this.descubrirVecinos(tablero, nx, ny);
          }
        }
      }
    }
  }

  alternarBandera(event: MouseEvent, i: number, j: number): void {
    event.preventDefault();
    if (this.juegoTerminado()) return;

    const tablero = this.tablero();
    const celda = tablero[i][j];
    if (celda.revelada) return;

    celda.marcada = !celda.marcada;
    this.reproducirSonido('bandera-busca-minas');
    this.minasRestantes.update((prev) => prev + (celda.marcada ? -1 : 1));
    this.tablero.set([...tablero]);
  }

  manejarTecla(event: KeyboardEvent, i: number, j: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.descubrir(i, j);
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.alternarBandera(new MouseEvent('contextmenu'), i, j);
    }
  }

  verificarVictoria(): void {
    const tablero = this.tablero();
    for (const fila of tablero) {
      for (const celda of fila) {
        if (!celda.mina && !celda.revelada) return;
      }
    }
    this.finalizarJuego(true);
  }

  finalizarJuego(ganaste: boolean): void {
    if (this.temporizadorId) clearInterval(this.temporizadorId);
    this.juegoTerminado.set(true);

    if (ganaste) {
      this.reproducirSonido('win');
      this.mensajeFinal.set('🎉 ¡Ganaste! Todos los campos seguros fueron revelados.');
    } else {
      this.reproducirSonido('boom-busca-minas');
      this.mensajeFinal.set('💥 ¡Perdiste! Pisaste una mina.');
    }
  }
}
