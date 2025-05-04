export interface Ichat {
  id: number;
  created_at: string;
  text: string;
  editable: boolean;
  sender: number; // ID del usuario

  Usuarios?: {
    id: number;
    nombre: string | null;
    avatarUrl: string | null;
    edad: number | null;
    created_at: string;
    authId: string | null;
  };
}
