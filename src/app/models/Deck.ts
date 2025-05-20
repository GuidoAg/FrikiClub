export interface Carta {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  suit: string;
  value: string;
}

export interface RespuestaNuevoMazo {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface RespuestaSacarCarta {
  success: boolean;
  deck_id: string;
  cards: Carta[];
  remaining: number;
}
