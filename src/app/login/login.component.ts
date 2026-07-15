import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    FloatLabel,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService)

  form = this.fb.group({
    email: ['', Validators.required],
    senha: ['', Validators.required],
  });

  async entrar() {
  if (this.form.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Preencha todos os campos corretamente.'
    });
    return;
  }

  const { email, senha } = this.form.getRawValue();

  try {
    const credential = await this.authService.login(email!, senha!);

    console.log('Usuário logado:', credential.user);

    this.messageService.add({
      severity: 'success',
      summary: 'Login realizado',
      detail: `Bem-vindo, ${credential.user.email}!`
    });

    await this.router.navigate(['/restrito/aulas']);

  } catch (error: any) {
    console.error(error);

    let mensagem = 'Ocorreu um erro ao realizar o login.';

    switch (error.code) {
      case 'auth/invalid-credential':
        mensagem = 'E-mail ou senha inválidos.';
        break;

      case 'auth/invalid-email':
        mensagem = 'O e-mail informado é inválido.';
        break;

      case 'auth/too-many-requests':
        mensagem = 'Muitas tentativas. Tente novamente mais tarde.';
        break;

      case 'auth/network-request-failed':
        mensagem = 'Sem conexão com a internet.';
        break;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao entrar',
      detail: mensagem
    });
  }
}
}
