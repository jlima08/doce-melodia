import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Cobranca } from '../models/cobranca.model';
import { orderBy } from 'firebase/firestore';

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

    const cobrancasRef = collection(this.firestore,'cobrancas');
    const q = query(cobrancasRef,orderBy('vencimento', 'desc'));

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