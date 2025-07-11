import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Encuesta } from '../../models/Encuesta';
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'friki-club-resultado-encuesta',
  imports: [CommonModule],
  templateUrl: './resultado-encuesta.component.html',
  styleUrl: './resultado-encuesta.component.scss'
})
export class ResultadoEncuestaComponent implements OnInit {

  
  constructor(private encuestaService: EncuestaService) {}

  cargando = false;
  encuestas: Encuesta[] = [];

  ngOnInit() {
    this.cargarEncuesta();
  }

  async cargarEncuesta() {
    this.cargando = true;

    try {
      this.encuestas = await this.encuestaService.obtenerEncuestas()
    } catch (e) {
      console.error('Error cargando encuestas:', e);
    }

    this.cargando = false;
  }
}