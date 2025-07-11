import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../../supabase-client';
import { UserService } from '../../services/user.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'friki-club-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  eMail: string;
  password: string;
  isErrorVisible = false;

  constructor(private router: Router, private userService: UserService) {
    this.eMail = '';
    this.password = '';
  }

  async onLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: this.eMail,
      password: this.password,
    });

    if (error) {
      console.error('Error:', error.message);
      this.isErrorVisible = true;
    } else {
      await this.userService.loadUserData();
      this.router.navigate(['/home']);
    }
  }

  onSignUp() {
    this.router.navigate(['/register']);
  }

  onAutoCompletarUsuario() {
    this.eMail = 'insua.guido@gmail.com';
    this.password = '123456';
  }

    onAutoCompletarAdmin() {
    this.eMail = 'kiwiears.late870@passmail.net';
    this.password = '123456';
  }
}
