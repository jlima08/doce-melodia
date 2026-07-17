import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardPageComponent } from '../components/card-page/card-page.component';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { Aluno } from '../../core/models/aluno.model';
import { AlunosService } from '../../core/services/alunos.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-alunos',
  imports: [
    CardPageComponent,
    ButtonModule,
    FloatLabelModule,
    MultiSelectModule,
    SelectModule,
    ReactiveFormsModule,
    InputMaskModule,
    InputTextModule,
    DatePickerModule,
    TableModule,
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    ToastModule
],
  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class AlunosComponent {
  private alunosService = inject(AlunosService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  CadAluno = false;
  loading = false;
  editando = false;
  idAluno: string | null = null;
  alunos: Aluno[] = [];

  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    nome: ['', Validators.required],
    sobrenome: ['', Validators.required],
    cpf: ['', Validators.required],
    contato: ['', Validators.required],
    dataNascimento: ['', Validators.required],
  });

  ngOnInit() {
    this.alunosService.listar().subscribe({
      next: (alunos) => {
        this.alunos = alunos;
      },

      error: (erro) => {
        console.error(erro);
      },
    });
  }

  btnCancelar(){
  this.form.reset()
  this.editando = false
  this.CadAluno = false
}

  async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos.',
      });

      return;
    }

    this.loading = true;

    try {
      const aluno = this.form.getRawValue();

      if (this.editando) {
        await this.alunosService.editar(this.idAluno!, aluno);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Aluno atualizado com sucesso!',
        });
      } else {
        const id = crypto.randomUUID();

        await this.alunosService.cadastrar(id, aluno);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Aluno cadastrado com sucesso!',
        });
      }

      this.form.reset({
        nome: '',
        sobrenome: '',
        cpf: '',
        contato: '',
        dataNascimento: '',
      });

      this.editando = false;
      this.idAluno = null;
      this.CadAluno = false;
    } catch (erro) {
      console.error(erro);

      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar aluno.',
      });
    } finally {
      this.loading = false;
    }
  }
  editarAluno(aluno: Aluno) {
    this.editando = true;

    this.idAluno = aluno.id!;

    this.CadAluno = true;

    this.form.patchValue({
      nome: aluno.nome,
      sobrenome: aluno.sobrenome,
      cpf: aluno.cpf,
      contato: aluno.contato,
      dataNascimento: aluno.dataNascimento,
    });
  }
  async excluirAluno(aluno: Aluno) {
    try {
      await this.alunosService.excluir(aluno.id!);

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Aluno excluído com sucesso.',
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível excluir.',
      });
    }
  }
  modalExcluir(event: Event, aluno: Aluno) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,

      message: `Deseja excluir ${aluno.nome}?`,

      header: 'Confirmar exclusão',

      icon: 'pi pi-exclamation-triangle',

      acceptButtonProps: {
        label: 'Excluir',

        severity: 'danger',
      },

      rejectButtonProps: {
        label: 'Cancelar',

        severity: 'secondary',

        outlined: true,
      },

      accept: () => {
        this.excluirAluno(aluno);
      },
    });
  }
}
