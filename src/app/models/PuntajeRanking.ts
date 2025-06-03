export interface PuntajeRanking {
  puntaje: number;
  fecha: string;
  user_id: number;
  Usuarios?: { nombre: string }; // 👈 NO es array, solo objeto
}
