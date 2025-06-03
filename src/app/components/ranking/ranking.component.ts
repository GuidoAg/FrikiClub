import { Component, OnInit } from '@angular/core';
import { PuntajeService } from '../../services/puntaje.service';
import { PuntajeRanking } from '../../models/PuntajeRanking'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'friki-club-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
})
export class RankingComponent implements OnInit {
  juegos = ['buscaminas', 'ahorcado', 'mayormenor', 'preguntados'];
  juegoActivo = 'buscaminas';

  ranking: PuntajeRanking[] = []; 
  cargando = false;

  constructor(private puntajeService: PuntajeService) {}

  ngOnInit() {
    this.cargarRanking(this.juegoActivo);
  }

  async cargarRanking(juego: string) {
    this.juegoActivo = juego;
    this.cargando = true;

    try {
      this.ranking = await this.puntajeService.obtenerRanking(juego);
    } catch (e) {
      console.error('Error cargando ranking:', e);
    }

    this.cargando = false;
  }
}
