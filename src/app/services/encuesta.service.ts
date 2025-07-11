import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';
import { Encuesta } from '../models/Encuesta';

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  constructor() {}

  async obtenerEncuestas(): Promise<Encuesta[]> {
    const { data, error } = await supabase
      .from('Encuestas')
      .select('usuario_id, nombre, edad, telefono, pregunta1, pregunta2, pregunta3, created_at');

    if (error) {
      console.error('Error al obtener encuestas:', error.message);
      throw error;
    }

    return (data ?? []).map((raw): Encuesta => ({
      usuario_id: raw.usuario_id,
      nombre: raw.nombre,
      edad: raw.edad,
      telefono: raw.telefono,
      pregunta1: raw.pregunta1,
      pregunta2: this.parsePregunta2(raw.pregunta2),
      pregunta3: raw.pregunta3,
      created_at: raw.created_at,
    }));
  }

  private parsePregunta2(value: string | null): string[] {
    try {
      const parsed = JSON.parse(value ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
