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
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlunosService {
   private firestore = inject(Firestore);

  private alunosCache = new BehaviorSubject<Aluno[]>([]);
  private carregado = false;

  listar(): Observable<Aluno[]> {

    if (!this.carregado) {

      const alunosRef = collection(this.firestore, 'alunos');

      collectionData(alunosRef, {
        idField: 'id'
      }).subscribe(alunos => {

        this.alunosCache.next(alunos as Aluno[]);
        this.carregado = true;

      });

    }

    return this.alunosCache.asObservable();

  }

  async cadastrar(id: string, aluno: Aluno) {

    const alunoRef = doc(this.firestore, 'alunos', id);

    await setDoc(alunoRef, aluno);

    this.carregado = false;

  }

  async editar(id: string, aluno: Aluno) {

    const alunoRef = doc(this.firestore, 'alunos', id);

    await updateDoc(alunoRef, {
      ...aluno,
    });

    this.carregado = false;

  }

  async excluir(id: string) {

    const alunoRef = doc(this.firestore, 'alunos', id);

    await deleteDoc(alunoRef);

    this.carregado = false;

  }
}
