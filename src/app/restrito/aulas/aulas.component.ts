import { Component, inject } from '@angular/core';
import { CardPageComponent } from "../components/card-page/card-page.component";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputMaskModule } from "primeng/inputmask";
import { ProfessoresService } from '../../core/services/professores.service';
import { SelectModule } from "primeng/select";
import { Professor } from '../../core/models/professor.model';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlunosService } from '../../core/services/alunos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Aluno } from '../../core/models/aluno.model';
import { Aula } from '../../core/models/aulas.model';
import { AulasService } from '../../core/services/aulas.service';
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-aulas',
  imports: [CardPageComponent, ButtonModule, FloatLabelModule, InputMaskModule, SelectModule, TableModule, ToastModule, FormsModule, ReactiveFormsModule, InputTextModule, RouterLink],
  templateUrl: './aulas.component.html',
  styleUrl: './aulas.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class AulasComponent {
  CadAulas = false
  editando = false
  loading =false  

  btnCancelar(){
  // this.form.reset()
  this.editando = false
  this.CadAulas = false
}

  private fb = inject(FormBuilder);

  private professoresService = inject(ProfessoresService);

  private alunosService = inject(AlunosService);

  private aulasService = inject(AulasService);

  private messageService = inject(MessageService);


  idAula: string | null = null;

  professores: Professor[] = [];

  alunos: Aluno[] = [];

  aulas: Aula[] = [];

  professorFiltro: Professor | null = null;
diaFiltro: string | null = null;
aulasFiltradas: Aula[] = [];

  instrumentosProfessor: {label:string,value:string}[] = [];

  diasSemana = [
    { label: 'Segunda-feira', value: 'Segunda' },
    { label: 'Terça-feira', value: 'Terça' },
    { label: 'Quarta-feira', value: 'Quarta' },
    { label: 'Quinta-feira', value: 'Quinta' },
    { label: 'Sexta-feira', value: 'Sexta' },
    { label: 'Sábado', value: 'Sábado' }
  ];

  form = this.fb.group({

    professor: [null as Professor | null, Validators.required],

    aluno: [null as Aluno | null, Validators.required],

    instrumento: ['', Validators.required],

    diaSemana: ['', Validators.required],

    horario: ['14:00', Validators.required]

  });

  ngOnInit() {

    this.buscarProfessores();

    this.buscarAlunos();

    this.buscarAulas();

    console.log(this.aulas);
    

  }

  buscarProfessores() {

    this.professoresService
      .listar()
      .subscribe(professores => {

        
      this.professores = professores.map(professor => ({
        ...professor,
        nomeCompleto: `${professor.nome} ${professor.sobrenome}`
      }));

      });

  }

  buscarAlunos() {

    this.alunosService
      .listar()
      .subscribe(alunos => {

        this.alunos = alunos.map(aluno => ({
        ...aluno,
        nomeCompleto: `${aluno.nome} ${aluno.sobrenome}`
      }));

      });

  }

  buscarAulas() {

    this.aulasService
      .listar()
      .subscribe(aulas => {

        this.aulas = aulas;
        this.aulasFiltradas = [...aulas];

      });

  }

  professorSelecionado() {

    const professor = this.form.value.professor;

    if (!professor) return;

    this.instrumentosProfessor =
      professor.instrumentos.map(item => ({

        label: item,

        value: item

      }));

    this.form.patchValue({

      instrumento: ''

    });

  }

  async salvar() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.messageService.add({

        severity:'warn',

        summary:'Atenção',

        detail:'Preencha todos os campos.'

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

        horario: this.form.value.horario!

      };

      if (this.editando) {

        await this.aulasService.editar(

          this.idAula!,

          aula

        );

      } else {

        const id = crypto.randomUUID();

        await this.aulasService.cadastrar(

          id,

          aula

        );

      }

      this.messageService.add({

        severity:'success',

        summary:'Sucesso',

        detail:'Aula salva com sucesso.'

      });

      this.form.reset();

      this.instrumentosProfessor = [];

      this.editando = false;

      this.idAula = null;

      this.CadAulas = false;

    } catch (erro) {

      console.error(erro);

      this.messageService.add({

        severity:'error',

        summary:'Erro',

        detail:'Não foi possível salvar.'

      });

    } finally {

      this.loading = false;

    }

  }

  filtrarAulas() {

  this.aulasFiltradas = this.aulas.filter(aula => {

    const professorOk =
      !this.professorFiltro ||
      aula.professorId === this.professorFiltro.id;

    const diaOk =
      !this.diaFiltro ||
      aula.diaSemana === this.diaFiltro;

    return professorOk && diaOk;

  });

}
limparFiltros() {

  this.professorFiltro = null;

  this.diaFiltro = null;

  this.aulasFiltradas = [...this.aulas];

}

}
