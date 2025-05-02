import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  constructor(private router: Router) {}

  onRegister() {
    console.log("Login presionado");
    console.log("hola")
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }

}
