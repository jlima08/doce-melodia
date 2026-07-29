import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Cobranca } from '../models/cobranca.model';

@Injectable({
  providedIn: 'root'
})
export class CobrancasService {

  private firestore = inject(Firestore);

  async cadastrar(id: string, cobranca: Cobranca) {

    const cobrancaRef = doc(
      this.firestore,
      `cobrancas/${id}`
    );

    return setDoc(cobrancaRef, cobranca);

  }

  listar(): Observable<Cobranca[]> {

    const cobrancasRef = collection(
      this.firestore,
      'cobrancas'
    );

    return collectionData(cobrancasRef, {
      idField: 'id'
    }) as Observable<Cobranca[]>;

  }

  buscarPorId(id: string) {

    const cobrancaRef = doc(
      this.firestore,
      `cobrancas/${id}`
    );

    return docData(cobrancaRef, {
      idField: 'id'
    }) as Observable<Cobranca>;

  }

  async editar(id: string, cobranca: Cobranca) {

    const cobrancaRef = doc(
      this.firestore,
      `cobrancas/${id}`
    );

    return updateDoc(cobrancaRef, {
      ...cobranca
    });

  }

  async excluir(id: string) {

    const cobrancaRef = doc(
      this.firestore,
      `cobrancas/${id}`
    );

    return deleteDoc(cobrancaRef);

  }

}