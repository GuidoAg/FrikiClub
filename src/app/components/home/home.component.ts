import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EstadoJuegoService } from '../../services/estado-juego.service';

@Component({
  selector: 'friki-club-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    private estadoJuego: EstadoJuegoService
  ) {}

  juegoSeleccionado = false;

  ngOnInit() {
    this.estadoJuego.salirJuego$.subscribe((salir) => {
      if (salir) {
        this.salirJuego();
        this.estadoJuego.resetearSalida(); // <- opcional: para que no vuelva a activarse automáticamente
      }
    });
  }

  async logout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  seleccionarJuego() {
    this.juegoSeleccionado = !this.juegoSeleccionado; // Cambia de false a true
  }

  salirJuego() {
    this.juegoSeleccionado = false;
  }
}
