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
  docData,
  orderBy
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

  listarPorAno(ano: number): Observable<Presenca[]> {
    const presencasRef = collection(this.firestore, 'presencas');

    const inicioAno = Timestamp.fromDate(new Date(ano, 0, 1, 0, 0, 0));
    const fimAno = Timestamp.fromDate(new Date(ano + 1, 0, 1, 0, 0, 0));

    const q = query(
      presencasRef,
      where('dataHora', '>=', inicioAno),
      where('dataHora', '<', fimAno),
      orderBy('dataHora', 'desc')
    );

    return collectionData(q, {
      idField: 'id'
    }) as Observable<Presenca[]>;
  }

}