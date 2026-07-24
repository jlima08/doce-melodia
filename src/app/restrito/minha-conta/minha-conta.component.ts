import { Component, inject } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { CardPageComponent } from "../components/card-page/card-page.component";
import { ToastModule } from "primeng/toast";
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { updatePassword } from 'firebase/auth';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Professor } from '../../core/models/professor.model';
import { ProfessoresService } from '../../core/services/professores.service';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-minha-conta',
  imports: [ButtonModule, FloatLabelModule, CardPageComponent, ToastModule, ReactiveFormsModule, InputTextModule, TextareaModule, FormsModule],
  templateUrl: './minha-conta.component.html',
  styleUrl: './minha-conta.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class MinhaContaComponent {
    private auth = inject(Auth);

  private professoresService = inject(ProfessoresService);

  private fb = inject(FormBuilder);

  private messageService = inject(MessageService);

  professor?: Professor;

  loading = false;

  form = this.fb.group({

    senha: ['', [Validators.required, Validators.minLength(6)]],

    confirmarSenha: ['', Validators.required]

  });

  ngOnInit() {

    this.buscarProfessor();

  }

  buscarProfessor() {

    const email = this.auth.currentUser?.email;

    if (!email) return;

    this.professoresService

      .buscarPorEmail(email)

      .subscribe(professor => {

        this.professor = professor;

      });

  }

  async alterarSenha() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    if (this.form.value.senha !== this.form.value.confirmarSenha) {

      this.messageService.add({

        severity: 'warn',

        summary: 'Atenção',

        detail: 'As senhas não conferem.'

      });

      return;

    }

    const user = this.auth.currentUser;

    if (!user) return;

    this.loading = true;

    try {

      await updatePassword(

        user,

        this.form.value.senha!

      );

      this.messageService.add({

        severity: 'success',

        summary: 'Sucesso',

        detail: 'Senha alterada com sucesso.'

      });

      this.form.reset();

    } catch (erro) {

      console.error(erro);

      this.messageService.add({

        severity: 'error',

        summary: 'Erro',

        detail: 'Não foi possível alterar a senha.'

      });

    } finally {

      this.loading = false;

    }

  }

}
