import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardPageComponent } from "../components/card-page/card-page.component";
import { ProfessoresService } from '../../core/services/professores.service';
import { Professor } from '../../core/models/professor.model';

import { FloatLabel, FloatLabelModule } from "primeng/floatlabel";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { getApps, initializeApp } from '@angular/fire/app';
import { createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { environment } from '../../environments';
import { ConfirmDialog, ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: 'app-professores',
  imports: [
    CardPageComponent,
    ButtonModule,
    FloatLabelModule,
    CommonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ToastModule,
    TableModule,
    ConfirmPopupModule,
    ConfirmDialogModule
],
  templateUrl: './professores.component.html',
  styleUrl: './professores.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ProfessoresComponent {
  CadProf = false;
  loading = false;
  editando = false;

idProfessor: string | null = null;
  professores: Professor[] = [];

  private professoresService = inject(ProfessoresService);
  private fb = inject(NonNullableFormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService)

  form = this.fb.group({
    nome: ['', Validators.required],
    sobrenome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    instrumentos: [[] as string[], Validators.required],
    admin: [false]
  })

  instrumentos = [
  { label: 'Violão', value: 'Violão' },
  { label: 'Guitarra', value: 'Guitarra' },
  { label: 'Piano', value: 'Piano' },
  { label: 'Teclado', value: 'Teclado' },
  { label: 'Bateria', value: 'Bateria' },
  { label: 'Baixo', value: 'Baixo' },
  { label: 'Canto', value: 'Canto' }
];
perfis = [
  {
    label: 'Professor',
    value: false
  },
  {
    label: 'Administrador',
    value: true
  }
];

ngOnInit() {

  this.professoresService.listar().subscribe({
    next: (dados) => {
      this.professores = dados;
    },
    error: (erro) => {
      console.error(erro);
    }
  });

}

btnCancelar(){
  this.form.reset()
  this.editando = false
  this.CadProf = false
}

async salvar() {

  if (this.form.invalid) {

    this.form.markAllAsTouched();

    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Preencha todos os campos obrigatórios.'
    });

    return;
  }

  this.loading = true;

  try {

    const { senha, ...professor } = this.form.getRawValue();

    if (this.editando) {

      await this.professoresService.editar(
        this.idProfessor!,
        professor as Professor
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Professor atualizado com sucesso!'
      });

    } else {

      // Cria/Reutiliza a instância secundária do Firebase
      const secondaryApp =
        getApps().find(app => app.name === 'Secondary') ??
        initializeApp(environment.firebase, 'Secondary');

      const secondaryAuth = getAuth(secondaryApp);

      // Cria o usuário no Authentication
      const credencial = await createUserWithEmailAndPassword(
        secondaryAuth,
        professor.email,
        senha
      );

      // Salva os dados do professor no Firestore
      await this.professoresService.cadastrar(
        credencial.user.uid,
        professor as Professor
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Professor cadastrado com sucesso!'
      });

    }

    this.form.reset({
      nome: '',
      sobrenome: '',
      email: '',
      senha: '',
      instrumentos: [],
      admin: false
    });

    this.editando = false;
    this.idProfessor = null;
    this.CadProf = false;

  } catch (erro) {

    console.error(erro);

    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Ocorreu um erro ao salvar o professor.'
    });

  } finally {

    this.loading = false;

  }

}

editarProfessor(professor: Professor) {
  this.editando = true;
  this.idProfessor = professor.id!;
  this.CadProf = true;

  this.form.patchValue({
    nome: professor.nome,
    sobrenome: professor.sobrenome,
    email: professor.email,
    instrumentos: professor.instrumentos,
    admin: professor.admin,
    senha: ''
    
  });
  // Remove os validadores da senha
  this.form.get('senha')?.clearValidators();
  this.form.get('senha')?.updateValueAndValidity();
}
async excluirProfessor(professor: Professor) {

  try {

    await this.professoresService.excluir(professor.id!);

    this.messageService.add({
      severity:'success',
      summary:'Professor removido',
      detail:'Professor excluído com sucesso.'
    });

  } catch (error) {

    this.messageService.add({
      severity:'error',
      summary:'Erro',
      detail:'Não foi possível excluir.'
    });

  }

}

modalExcluir(event: Event, professor: Professor) {

  this.confirmationService.confirm({

    target: event.target as EventTarget,

    message: `Deseja realmente excluir o professor(a) ${professor.nome}?`,

    header: 'Confirmar exclusão',

    icon: 'pi pi-exclamation-triangle',

    rejectButtonProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true,
    },

    acceptButtonProps: {
      label: 'Excluir',
      severity: 'danger',
      icon: 'pi pi-trash',
    },

    accept: () => {
      this.excluirProfessor(professor);
    }

  });

}

}
