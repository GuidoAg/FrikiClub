import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  providers: [provideNativeDateAdapter()],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(private router: Router) {}

  selectedDate: Date | null = null;

  // Puedes usar esta función para imprimir la fecha
  mostrarFecha() {
    console.log(this.selectedDate);
  }

  onRegister() {
    console.log('Login presionado');
    console.log('hola');
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    //this.avatarFile = event.target.files[0];
  }
}
