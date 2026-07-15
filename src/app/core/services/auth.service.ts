import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private auth = inject(Auth);

  login(email: string, senha: string) {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  logout() {
    return signOut(this.auth);
  }

  usuarioLogado() {
    return this.auth.currentUser;
  }

  criarUsuario(email: string, senha: string) {
  return createUserWithEmailAndPassword(
    this.auth,
    email,
    senha
  );
  }

}
