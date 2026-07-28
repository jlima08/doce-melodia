import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc, query, updateDoc, where } from '@angular/fire/firestore';
import { Professor } from '../models/professor.model';
import { map, Observable } from 'rxjs';
// import { query, updateDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProfessoresService {

  private firestore = inject(Firestore);

  async cadastrar(uid: string, professor: Professor) {
  const professorRef = doc(this.firestore, 'professores', uid);
  return setDoc(professorRef, professor);
}

  listar(): Observable<Professor[]> {

    const professoresRef = collection(this.firestore, 'professores');

    return collectionData(professoresRef, {
      idField: 'id'
    }) as Observable<Professor[]>;

  }

  async editar(id: string, professor: Professor) {

  const professorRef = doc(this.firestore, `professores/${id}`);

  return updateDoc(professorRef, {
    ...professor
  });

}

async excluir(id: string) {

  const professorRef = doc(this.firestore, `professores/${id}`);

  return deleteDoc(professorRef);

}

buscarPorId(uid: string): Observable<Professor> {

  const professorRef = doc(this.firestore, 'professores', uid);

  return docData(professorRef, {
    idField: 'id'
  }) as Observable<Professor>;

}
buscarPorEmail(email: string) {

  const professoresRef = collection(
    this.firestore,
    'professores'
  );

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
