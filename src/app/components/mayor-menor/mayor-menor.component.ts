import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeckService } from '../../services/deck.service';
import { Carta } from '../../models/Deck';
import { UserService } from '../../services/user.service';
import { PuntajeService } from '../../services/puntaje.service';

@Component({
  selector: 'friki-club-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.scss'],
})
export class MayorMenorComponent implements OnInit {
  cartaActual: Carta | null = null;
  siguienteCarta: Carta | null = null;
  cartasRestantes: Carta[] = [];
  puntaje = 0;
  mensaje = '';
  cargando = false;
  terminado = false;
  cartaRevelada = false;

  private audios: Record<string, HTMLAudioElement> = {};

  constructor(
    private deckService: DeckService,
    private userService: UserService,
    private puntajeService: PuntajeService
  ) {
    this.preloadAudios();
  }

  ngOnInit(): void {
    this.iniciarJuego();
  }

  preloadAudios() {
    const sonidos = ['punto', 'win'];
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
    this.cargando = true;
    this.puntaje = 0;
    this.mensaje = '';
    this.terminado = false;
    this.cartaRevelada = false;
    this.cartasRestantes = [];
    this.cartaActual = null;
    this.siguienteCarta = null;

    this.deckService.crearMazo().subscribe((res) => {
      this.deckService.setDeckId(res.deck_id);
      this.deckService.sacarCarta(52).subscribe((cartaRes) => {
        this.cartasRestantes = cartaRes.cards;
        this.cartaActual = this.cartasRestantes.shift() || null;
        this.siguienteCarta = this.cartasRestantes.shift() || null;
        this.preloadCardImages(this.cartasRestantes);
        this.cargando = false;
      });
    });
  }

  adivinar(tipo: 'mayor' | 'menor' | 'igual'): void {
    if (
      !this.cartaActual ||
      !this.siguienteCarta ||
      this.cartaRevelada ||
      this.terminado
    )
      return;

    const actual = this.valorCarta(this.cartaActual.value);
    const siguiente = this.valorCarta(this.siguienteCarta.value);

    let acierto = false;

    if (tipo === 'mayor') {
      acierto = siguiente > actual;
    } else if (tipo === 'menor') {
      acierto = siguiente < actual;
    } else if (tipo === 'igual') {
      acierto = siguiente === actual;
    }

    this.cartaRevelada = true;

    if (acierto) {
      this.mensaje = tipo === 'igual' ? '¡Correcto! (Iguales)' : '¡Correcto!';
      this.puntaje += tipo === 'igual' ? 2 : 1;
      this.reproducirSonido('punto');
    } else {
      this.mensaje = '¡Incorrecto!';
      this.reproducirSonido('win');
      this.terminado = true;

      const usuario = this.userService.getCurrentUser();
      if (usuario) {
        this.puntajeService.guardarPuntaje(usuario, 'mayormenor', this.puntaje);
      }
    }
  }

  siguienteRonda(): void {
    if (!this.cartaRevelada || this.terminado) return;

    this.cartaActual = this.siguienteCarta;
    this.siguienteCarta = this.cartasRestantes.shift() || null;
    this.mensaje = '';
    this.cartaRevelada = false;

    if (!this.siguienteCarta) {
      this.terminado = true;
      this.mensaje = '¡Ganaste! Se terminaron las cartas del mazo 🎉';
      this.reproducirSonido('win');

      const usuario = this.userService.getCurrentUser();
      if (usuario) {
        this.puntajeService.guardarPuntaje(usuario, 'mayormenor', this.puntaje);
      }
    }
  }

  valorCarta(valor: string): number {
    const mapa: Record<string, number> = {
      ACE: 14,
      KING: 13,
      QUEEN: 12,
      JACK: 11,
    };
    return mapa[valor] ?? parseInt(valor, 10);
  }

  preloadCardImages(cartas: Carta[]): void {
    cartas.forEach((c) => {
      const img = new Image();
      img.src = c.image;
    });
  }
}
