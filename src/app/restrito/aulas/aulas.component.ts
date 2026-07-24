import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { firstValueFrom } from 'rxjs';

import { CardPageComponent } from '../components/card-page/card-page.component';

import { ProfessoresService } from '../../core/services/professores.service';
import { AlunosService } from '../../core/services/alunos.service';
import { AulasService } from '../../core/services/aulas.service';
import { Professor } from '../../core/models/professor.model';
import { Aluno } from '../../core/models/aluno.model';
import { Aula } from '../../core/models/aulas.model';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-aulas',
  imports: [
    CardPageComponent,
    ButtonModule,
    FloatLabelModule,
    InputMaskModule,
    SelectModule,
    TableModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    RouterLink,
    ConfirmDialogModule,
    CommonModule
  ],
  templateUrl: './aulas.component.html',
  styleUrl: './aulas.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class AulasComponent {
  CadAulas = false;
  editando = false;
  loading = false;

  btnCancelar() {

  this.form.reset({
    professor: null,
    aluno: null,
    instrumento: '',
    diaSemana: '',
    horario: '14:00',
    dataInicio: '2026-01-01'
  });

  this.instrumentosProfessor = [];

  this.editando = false;

  this.idAula = null;

  this.CadAulas = false;

}

  private fb = inject(FormBuilder);
  private professoresService = inject(ProfessoresService);
  private alunosService = inject(AlunosService);
  private aulasService = inject(AulasService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private auth = inject(Auth);
  private authService = inject(AuthService);

  idAula: string | null = null;
  professores: Professor[] = [];
  professor?: Professor
  alunos: Aluno[] = [];
  aulas: Aula[] = [];
  usuario: any

  professorFiltro: Professor | null = null;
  diaFiltro: string | null = null;
  aulasFiltradas: Aula[] = [];

  instrumentosProfessor: { label: string; value: string }[] = [];

  diasSemana = [
    { label: 'Segunda-feira', value: 'Segunda' },
    { label: 'Terça-feira', value: 'Terça' },
    { label: 'Quarta-feira', value: 'Quarta' },
    { label: 'Quinta-feira', value: 'Quinta' },
    { label: 'Sexta-feira', value: 'Sexta' },
    { label: 'Sábado', value: 'Sábado' },
  ];

  form = this.fb.group({
    professor: [null as Professor | null, Validators.required],
    aluno: [null as Aluno | null, Validators.required],
    instrumento: ['', Validators.required],
    diaSemana: ['', Validators.required],
    horario: ['14:00', Validators.required],
    dataInicio: ['2026-01-01', Validators.required],
  });

  ngOnInit() {
   this.buscarProfessores();
  this.buscarAlunos();
  
  const authUser = this.authService.usuarioLogado();
  if (!authUser) return;

  this.professoresService
      .buscarPorId(authUser.uid)
      .subscribe(usuario => {

        this.usuario = usuario;

      });

    
  

  const email = this.auth.currentUser?.email;

  if (!email) return;
  
  this.professoresService
    .buscarPorEmail(email)
    .subscribe(professor => {

      if (!professor) return;

      if (professor.admin) {

        this.buscarAulas();

      } else {

        this.buscarAulasProfessor(professor.id!);

      }

    });
  }
  usuarioLogado() {
    return this.auth.currentUser;
  }
  buscarAulasProfessor(professorId: string) {

  this.aulasService
    .listarPorProfessor(professorId)
    .subscribe(aulas => {

      this.aulas = aulas;
      this.aulasFiltradas = [...aulas];

    });

}

  buscarProfessores() {
    
    this.professoresService.listar().subscribe((professores) => {
      
      this.professores = professores.map((professor) => ({
        ...professor,
        nomeCompleto: `${professor.nome} ${professor.sobrenome}`,
      }));
      this.professores = professores
    });
  }

  buscarAlunos() {
    this.alunosService.listar().subscribe((alunos) => {
      this.alunos = alunos.map((aluno) => ({
        ...aluno,
        nomeCompleto: `${aluno.nome} ${aluno.sobrenome}`,
      }));
    });
  }

  buscarAulas() {
    this.aulasService.listar().subscribe((aulas) => {
      this.aulas = aulas;
      this.aulasFiltradas = [...aulas];
    });
  }

  professorSelecionado() {
    const professor = this.form.value.professor;

    if (!professor) return;

    this.instrumentosProfessor = professor.instrumentos.map((item) => ({
      label: item,
      value: item,
    }));

    this.form.patchValue({
      instrumento: '',
    });
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
      const professor = this.form.value.professor!;

      const aluno = this.form.value.aluno!;

      const aula: Aula = {
        professorId: professor.id!,
        professorNome: `${professor.nome} ${professor.sobrenome}`,
        alunoId: aluno.id!,
        alunoNome: `${aluno.nome} ${aluno.sobrenome}`,
        instrumento: this.form.value.instrumento!,
        diaSemana: this.form.value.diaSemana!,
        horario: this.form.value.horario!,
        dataInicio: this.form.value.dataInicio!,
      };

      const aulas = await firstValueFrom(this.aulasService.listar());

// Aluno já possui aula nesse horário?
const conflitoAluno = aulas.some(a =>
  a.alunoId === aula.alunoId &&
  a.diaSemana === aula.diaSemana &&
  a.horario === aula.horario &&
  a.id !== this.idAula
);

if (conflitoAluno) {

  this.messageService.add({
    severity: 'warn',
    summary: 'Conflito de horário',
    detail: 'O aluno já possui uma aula nesse dia e horário.'
  });

  this.loading = false;
  return;
}

// Professor já possui aula nesse horário?
const conflitoProfessor = aulas.some(a =>
  a.professorId === aula.professorId &&
  a.diaSemana === aula.diaSemana &&
  a.horario === aula.horario &&
  a.id !== this.idAula
);

if (conflitoProfessor) {

  this.messageService.add({
    severity: 'warn',
    summary: 'Conflito de horário',
    detail: 'O professor já possui uma aula nesse dia e horário.'
  });

  this.loading = false;
  return;
}

      if (this.editando) {
        await this.aulasService.editar(
          this.idAula!,
          aula,
        );
      } else {
        const id = crypto.randomUUID();

        await this.aulasService.cadastrar(
          id,
          aula,
        );
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Aula salva com sucesso.',
      });

      this.form.reset({
        professor: null,
        aluno: null,
        instrumento: '',
        diaSemana: '',
        horario: '14:00',
        dataInicio: '2026-01-01'
      });

      this.instrumentosProfessor = [];

      this.editando = false;
      this.idAula = null;
      this.CadAulas = false;
    } catch (erro) {
      console.error(erro);

      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível salvar.',
      });
    } finally {
      this.loading = false;
    }
  }

  filtrarAulas() {
    this.aulasFiltradas = this.aulas.filter((aula) => {
      const professorOk =
        !this.professorFiltro || aula.professorId === this.professorFiltro.id;

      const diaOk = !this.diaFiltro || aula.diaSemana === this.diaFiltro;

      return professorOk && diaOk;
    });
  }
  limparFiltros() {
    this.professorFiltro = null;
    this.diaFiltro = null;
    this.aulasFiltradas = [...this.aulas];
  }

  async excluirAula(aula: Aula) {
    try {
      await this.aulasService.excluir(aula.id!);

      this.messageService.add({
        severity: 'success',
        summary: 'Aula removida',
        detail: 'Aula excluído com sucesso.',
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível excluir.',
      });
    }
  }
  modalExcluir(event: Event, aula: Aula) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja realmente excluir a aula do aluno(a) <b>${aula.alunoNome}</b> ?`,
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
        this.excluirAula(aula);
      },
    });
  }

  editarAula(aula: Aula) {
    this.editando = true;
    this.idAula = aula.id!;
    this.CadAulas = true;
    const professor = this.professores.find((p) => p.id === aula.professorId);
    const aluno = this.alunos.find((a) => a.id === aula.alunoId);

    if (professor) {
      this.instrumentosProfessor = professor.instrumentos.map((item) => ({
        label: item,
        value: item,
      }));
    }

    this.form.patchValue({
      professor: professor ?? null,
      aluno: aluno ?? null,
      instrumento: aula.instrumento,
      diaSemana: aula.diaSemana,
      horario: aula.horario,
    });
  }
  

}
