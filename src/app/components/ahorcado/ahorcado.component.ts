import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PuntajeService } from '../../services/puntaje.service';
import { UserService } from '../../services/user.service';

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

  imagenesPreCargadas: HTMLImageElement[] = [];

  audios: Record<string, HTMLAudioElement> = {};

  diccionarios: Record<string, string[]> = {};

  constructor(
    private http: HttpClient,
    private puntajeService: PuntajeService,
    private userService: UserService
  ) {
    this.preloadImagenes();
    this.preloadAudios();
    this.iniciarTemporizador();

    this.preloadDiccionarios().then(() => {
      this.iniciarJuego();
    });
  }

  preloadImagenes() {
    for (let i = 0; i <= 6; i++) {
      const img = new Image();
      img.src = `assets/imagenes/${i}.png`;
      this.imagenesPreCargadas.push(img);
    }
  }

  preloadAudios() {
    const sonidos = ['win', 'punto'];
    sonidos.forEach((nombre) => {
      const audio = new Audio(`assets/sounds/${nombre}.mp3`);
      audio.load();
      this.audios[nombre] = audio;
    });
  }

  reproducirSonido(nombre: string): void {
    const audio = this.audios[nombre];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch((err) => console.error('Error sonido:', err));
  }

  async preloadDiccionarios() {
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (const letra of letras) {
      const palabras = await this.cargarPalabrasPorLetra(letra);
      this.diccionarios[letra] = palabras;
    }
  }

  async iniciarJuego() {
    const letraInicial = this.getLetraAleatoria();
    const palabras = this.diccionarios[letraInicial] || ['pepe'];

    const aciertos = this.aciertos();
    let maxLongitud = 10;
    if (aciertos === 0) maxLongitud = 4;
    else if (aciertos === 1) maxLongitud = 5;
    else if (aciertos === 2) maxLongitud = 6;

    let palabrasFiltradas = palabras.filter((p) => {
      const limpia = this.limpiarPalabra(p);
      return limpia.length >= 3 && limpia.length <= maxLongitud;
    });

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map((_) => '_')
    );
    this.juegoTerminado.set(false);
    this.mostrarResumen.set(false);
    this.vidas.set(6);
    this.letrasUsadas.set([]);
  }

  getLetraAleatoria(): string {
    const letras = 'abc'; //abcdefghijklmnopqrstuvwxyz';
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
        this.reproducirSonido('punto');
        setTimeout(() => this.iniciarJuego(), 400);
      }
    } else {
      this.vidas.update((v) => v - 1);
      if (this.vidas() === 0) {
        this.finalizarJuego();
      }
    }
  }

  finalizarJuego() {
    if (this.temporizadorId) {
      clearInterval(this.temporizadorId);
      this.temporizadorId = null;
    }

    this.juegoTerminado.set(true);
    this.mostrarResumen.set(true);
    this.reproducirSonido('win');
    this.guardarPuntajeFinal();
  }

  async guardarPuntajeFinal() {
    const usuario = this.userService.getCurrentUser();
    const puntaje = this.aciertos(); // puede ser otra lógica si querés que el tiempo también influya

    try {
      if (usuario) {
        await this.puntajeService.guardarPuntaje(usuario, 'ahorcado', puntaje);

        console.log('Puntaje guardado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar el puntaje:', error);
    }
  }

  reiniciar() {
    this.aciertos.set(0);
    this.tiempo.set(0);
    this.iniciarTemporizador();
    this.iniciarJuego();
  }

  iniciarTemporizador() {
    if (this.temporizadorId) return;

    this.temporizadorId = setInterval(() => {
      this.tiempo.update((t) => t + 1);
    }, 1000);
  }

  get imagenActual(): string {
    return `assets/imagenes/${6 - this.vidas()}.png`;
  }
}
