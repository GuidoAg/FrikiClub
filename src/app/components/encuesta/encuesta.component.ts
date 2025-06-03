import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Encuesta } from '../../models/Encuesta';
import { supabase } from '../../supabase-client';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'friki-club-home',
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class EncuestaComponent implements OnInit {
  encuestaForm!: FormGroup;
  enviado = false;
  guardadoExitoso = false;

  readonly opcionesCheckbox = ['Busca minas', 'Ahorcado', 'Preguntado', 'Mayor menor'];
  readonly opcionesRadio = ['Sí', 'No', 'Tal vez'];

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      pregunta1: ['', Validators.required],
      pregunta2: this.fb.array([], Validators.required),
      pregunta3: ['', Validators.required],
    });
  }

  get f() {
    return this.encuestaForm.controls;
  }

  onCheckboxChange(event: Event) {
    const checkboxArray = this.encuestaForm.get('pregunta2') as FormArray;
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      checkboxArray.push(this.fb.control(target.value));
    } else {
      const index = checkboxArray.controls.findIndex(
        (x) => x.value === target.value
      );
      if (index >= 0) checkboxArray.removeAt(index);
    }
  }

  async enviar(): Promise<void> {
    this.enviado = true;
    this.guardadoExitoso = false;

    if (this.encuestaForm.invalid) return;

    const usuario = this.userService.getCurrentUser();
    if (!usuario) {
      alert('No se encontró el usuario logueado');
      return;
    }

    const nuevaEncuesta: Encuesta = {
      usuario_id: usuario.id,
      nombre: this.f['nombre'].value,
      edad: this.f['edad'].value,
      pregunta1: this.f['pregunta1'].value,
      pregunta2: this.f['pregunta2'].value,
      pregunta3: this.f['pregunta3'].value,
    };

    const { error } = await supabase.from('Encuestas').insert([nuevaEncuesta]);

    if (error) {
      console.error('Error al guardar encuesta:', error.message);
      alert('Hubo un error al guardar la encuesta');
    } else {
      this.guardadoExitoso = true;
      this.encuestaForm.reset();
      this.enviado = false;

      const checkboxArray = this.encuestaForm.get('pregunta2') as FormArray;
      while (checkboxArray.length) checkboxArray.removeAt(0);
    }
  }
}
