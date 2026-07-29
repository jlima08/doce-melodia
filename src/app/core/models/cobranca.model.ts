import { Timestamp } from "@angular/fire/firestore";

export interface Cobranca {

  id?: string;

  alunoId: string;

  alunoNome: string;

  contato: string;

  valor: number;

  vencimento: Timestamp;

  pago: boolean;

  dataPagamento?: Timestamp;

}