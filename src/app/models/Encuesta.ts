export interface Encuesta {
  usuario_id: number;
  nombre: string;
  edad: number;
  telefono: number;
  pregunta1: string;
  pregunta2: string[];
  pregunta3: string;
  created_at?: string;
}
