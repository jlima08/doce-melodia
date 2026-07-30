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
  updateDoc,
  where
} from '@angular/fire/firestore';

import { BehaviorSubject, map, Observable } from 'rxjs';
import { Professor } from '../models/professor.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessoresService {

  private firestore = inject(Firestore);

  private professoresCache = new BehaviorSubject<Professor[]>([]);
  private carregado = false;

  listar(): Observable<Professor[]> {

    if (!this.carregado) {

      const professoresRef = collection(this.firestore, 'professores');

      collectionData(professoresRef, {
        idField: 'id'
      }).subscribe(professores => {

        this.professoresCache.next(professores as Professor[]);
        this.carregado = true;

      });

    }

    return this.professoresCache.asObservable();

  }

  async cadastrar(uid: string, professor: Professor) {

    const professorRef = doc(this.firestore, 'professores', uid);

    await setDoc(professorRef, professor);

    this.professoresCache.next([
      ...this.professoresCache.value,
      {
        id: uid,
        ...professor
      }
    ]);

  }

  async editar(id: string, professor: Professor) {

    const professorRef = doc(this.firestore, `professores/${id}`);

    await updateDoc(professorRef, {
      ...professor
    });

    this.professoresCache.next(

      this.professoresCache.value.map(p =>

        p.id === id
          ? { id, ...professor }
          : p

      )

    );

  }

  async excluir(id: string) {

    const professorRef = doc(this.firestore, `professores/${id}`);

    await deleteDoc(professorRef);

    this.professoresCache.next(

      this.professoresCache.value.filter(p => p.id !== id)

    );

  }

  buscarPorId(uid: string): Observable<Professor> {

    const professorRef = doc(this.firestore, 'professores', uid);

    return docData(professorRef, {
      idField: 'id'
    }) as Observable<Professor>;

  }

  buscarPorEmail(email: string) {

    // Procura primeiro no cache
    const professor = this.professoresCache.value.find(
      p => p.email === email
    );

    if (professor) {

      return new Observable<Professor>(observer => {

        observer.next(professor);
        observer.complete();

      });

    }

    // Caso ainda não esteja carregado
    const professoresRef = collection(this.firestore, 'professores');

    const q = query(
      professoresRef,
      where('email', '==', email)
    );

    return collectionData(q, {
      idField: 'id'
    }).pipe(
      map(lista => lista[0] as Professor)
    );

  }

}