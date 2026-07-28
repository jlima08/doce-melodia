import { Timestamp } from '@angular/fire/firestore';

export interface Presenca {

  id?: string;
  aulaId: string;
  professorId: string;
  alunoId: string;
  dataHora: Timestamp;
   reposicao: boolean;

}