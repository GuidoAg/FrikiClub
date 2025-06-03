import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';
import { Usuarios } from '../models/Usuarios';
import { PuntajeRanking } from '../models/PuntajeRanking';

@Injectable({
  providedIn: 'root',
})
export class PuntajeService {
  async guardarPuntaje(
    user: Usuarios,
    juego: string,
    puntaje: number
  ): Promise<void> {
    if (!user) return;

    const { data: existentes } = await supabase
      .from('Puntajes')
      .select('*')
      .eq('user_id', user.id)
      .eq('juego', juego);

    const mejor = existentes?.[0];
    const mejorValor = mejor?.puntaje;

    const esBuscaminas = juego === 'buscaminas';
    const esMejor =
      !mejor || (esBuscaminas ? puntaje < mejorValor : puntaje > mejorValor);

    if (esMejor) {
      if (mejor) {
        await supabase.from('Puntajes').delete().eq('id', mejor.id);
      }

      await supabase.from('Puntajes').insert({
        user_id: user.id,
        juego,
        puntaje,
        fecha: new Date().toISOString(),
      });
    }
  }

async obtenerRanking(juego: string): Promise<PuntajeRanking[]> {
  const { data, error } = await supabase
    .from('Puntajes')
    .select('puntaje, fecha, user_id, Usuarios(nombre)')
    .eq('juego', juego);

  if (error) throw error;

  const agrupados = new Map<number, PuntajeRanking>();

  for (const rawEntry of data as any[]) {
    const usuario = Array.isArray(rawEntry.Usuarios)
      ? rawEntry.Usuarios[0]
      : rawEntry.Usuarios;

    const entry: PuntajeRanking = {
      puntaje: rawEntry.puntaje,
      fecha: rawEntry.fecha,
      user_id: rawEntry.user_id,
      Usuarios: usuario ? { nombre: usuario.nombre } : undefined,
    };

    const existente = agrupados.get(entry.user_id);
    const esBuscaminas = juego === 'buscaminas';

    if (
      !existente ||
      (esBuscaminas
        ? entry.puntaje < existente.puntaje
        : entry.puntaje > existente.puntaje)
    ) {
      agrupados.set(entry.user_id, entry);
    }
  }

  const ranking = Array.from(agrupados.values());
  ranking.sort((a, b) =>
    juego === 'buscaminas' ? a.puntaje - b.puntaje : b.puntaje - a.puntaje
  );

  return ranking;
}


}
