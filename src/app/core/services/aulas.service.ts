import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  docData,
  Firestore,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';

import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

import { Aula } from '../models/aulas.model';

@Injectable({
  providedIn: 'root'
})
export class AulasService {

  private firestore = inject(Firestore);

  listar(): Observable<Aula[]> {

    const aulasRef = collection(this.firestore, 'aulas');

    return collectionData(aulasRef, {
      idField: 'id'
    }) as Observable<Aula[]>;

  }

  cadastrar(id: string, aula: Aula) {

    const aulaRef = doc(this.firestore, 'aulas', id);

    return setDoc(aulaRef, aula);

  }

  editar(id: string, aula: Aula) {

    const aulaRef = doc(this.firestore, 'aulas', id);

    return updateDoc(aulaRef, {
      ...aula
    });

  }

  excluir(id: string) {

    const aulaRef = doc(this.firestore, 'aulas', id);

    return deleteDoc(aulaRef);

  }

  buscarPorId(id: string): Observable<Aula> {

    const aulaRef = doc(this.firestore, 'aulas', id);

    return docData(aulaRef, {
      idField: 'id'
    }) as Observable<Aula>;

  }

}