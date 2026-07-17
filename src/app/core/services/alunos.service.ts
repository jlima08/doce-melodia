import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';

import { Aluno } from '../models/aluno.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlunosService {
  private firestore = inject(Firestore);

 listar(): Observable<Aluno[]> {

  const alunosRef = collection(this.firestore, 'alunos');

  return collectionData(alunosRef, {
    idField: 'id'
  }) as Observable<Aluno[]>;

}

  cadastrar(id: string, aluno: Aluno) {
    const alunoRef = doc(this.firestore, 'alunos', id);

    return setDoc(alunoRef, aluno);
  }

  editar(id: string, aluno: Aluno) {
    const alunoRef = doc(this.firestore, 'alunos', id);

    return updateDoc(alunoRef, {
      ...aluno,
    });
  }

  excluir(id: string) {
    const alunoRef = doc(this.firestore, 'alunos', id);

    return deleteDoc(alunoRef);
  }
}
