import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where,
  Timestamp,
  doc,
  docData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Presenca } from '../models/presenca.model';
import { Aula } from '../models/aulas.model';

@Injectable({
  providedIn: 'root'
})
export class PresencasService {

  private firestore = inject(Firestore);

  marcar(aulaId: string, professorId: string, alunoId: string, reposicao:boolean) {

    const presencasRef = collection(this.firestore, 'presencas');

    return addDoc(presencasRef, {

      aulaId,
      professorId,
      alunoId,
      dataHora: Timestamp.now(),
      reposicao

    });

  }

  listarPorAula(aulaId: string): Observable<Presenca[]> {

    const presencasRef = collection(this.firestore, 'presencas');

    const q = query(
      presencasRef,
      where('aulaId', '==', aulaId)
    );

    return collectionData(q, {
      idField: 'id'
    }) as Observable<Presenca[]>;

  }
  buscarPorId(id: string): Observable<Aula> {

  const aulaRef = doc(this.firestore, `aulas/${id}`);

  return docData(aulaRef, {

    idField: 'id'

  }) as Observable<Aula>;

}

}