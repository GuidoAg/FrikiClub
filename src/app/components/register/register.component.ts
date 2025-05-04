import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'friki-club-register',
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
  eMail: string;
  password: string;
  rePassword: string;
  name: string;
  age: number;
  selectedDate: Date | null = null;
  avatarFile: File | null = null;
  errorMessage: string;
  isErrorVisible: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.eMail = '';
    this.password = '';
    this.rePassword = '';
    this.name = '';
    this.age = 0;
    this.errorMessage = '';
    this.isErrorVisible = false;
  }

  calculateAgeFromDate(): void {
    if (!this.selectedDate) {
      this.age = 0;
      return;
    }

    const today = new Date();
    const birthDate = new Date(this.selectedDate);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    this.age = calculatedAge;
    console.log(this.age);
  }

  validateForm(): string | null {
    if (this.name.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.eMail)) {
      return 'Correo electrónico no válido.';
    }

    if (this.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (this.password !== this.rePassword) {
      return 'Las contraseñas no coinciden.';
    }

    if (this.age < 18 || this.age > 120) {
      return 'La edad debe estar entre 18 y 120 años.';
    }

    if (!this.avatarFile || this.avatarFile.type !== 'image/png') {
      return 'Debes subir una imagen PNG como avatar.';
    }

    return null;
  }

  async register() {
    this.calculateAgeFromDate();

    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      this.isErrorVisible = true;
      return;
    }

    this.isErrorVisible = false;

    const result = await this.userService.registerUser(
      this.name,
      this.age,
      this.eMail,
      this.password,
      this.avatarFile!
    );

    if (!result.success) {
      this.errorMessage = result.error!;
      this.isErrorVisible = true;
    } else {
      this.router.navigate(['/confirmacion']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.avatarFile = input.files[0];
    }
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}
