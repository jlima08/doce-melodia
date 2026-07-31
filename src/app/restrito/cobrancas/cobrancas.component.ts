import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CardPageComponent } from '../components/card-page/card-page.component';

import { AlunosService } from '../../core/services/alunos.service';
// import { CobrancasService } from '../../core/services/cobrancas.service';

import { Aluno } from '../../core/models/aluno.model';
import { Cobranca } from '../../core/models/cobranca.model';

import { ConfirmationService, MessageService } from 'primeng/api';
import { CobrancasService } from '../../core/services/cobrancas.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { DatePickerClasses, DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Timestamp } from '@angular/fire/firestore';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-cobrancas',
  imports: [
    CardPageComponent,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CommonModule,
    FloatLabelModule,
    InputMaskModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    TableModule,
    Dialog,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
  ],
  templateUrl: './cobrancas.component.html',
  styleUrl: './cobrancas.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class CobrancasComponent {

  private fb = inject(FormBuilder);
  private alunosService = inject(AlunosService);
  private cobrancasService = inject(CobrancasService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  CadCobrancas = false;
  loading = false;
  editando = false;
  mostrarModalPagamento = false;

  cobrancaSelecionada!: Cobranca;
  proximoVencimento: Date | null = null;
  idCobranca: string | null = null;

  alunos: Aluno[] = [];
  cobrancas: Cobranca[] = [];
  cobrancasFiltradas: Cobranca[] = [];

  form = this.fb.group({
    aluno: [null as Aluno | null, Validators.required],
    contato: ['', Validators.required],
    valor: [200, Validators.required],
    vencimento: [new Date(), Validators.required],
  });

  btnCancelar() {
    this.form.reset({
      aluno: null,
      contato: '',
      valor: 0,
      vencimento: null,
    });

    this.editando = false;
    this.idCobranca = null;
    this.CadCobrancas = false;
  }

  modalPagamento(cobranca: Cobranca) {
    this.cobrancaSelecionada = cobranca;
    this.mostrarModalPagamento = true;
  }

  ngOnInit() {
    this.buscarAlunos();
    this.buscarCobrancas();
  }

  buscarAlunos() {
    this.alunosService.listar().subscribe((alunos) => {
      this.alunos = alunos.map((aluno) => ({
        ...aluno,

        nomeCompleto: `${aluno.nome} ${aluno.sobrenome}`,
      }));
    });
  }

  buscarCobrancas() {
    this.cobrancasService.listar().subscribe((cobrancas) => {
      this.cobrancas = cobrancas;

      this.cobrancasFiltradas = [...cobrancas];
    });
  }

  alunoSelecionado() {
    const aluno = this.form.value.aluno;

    if (!aluno) return;

    const contato = aluno.menorIdade
      ? aluno.contatoResponsavel!
      : aluno.contato;

    this.form.patchValue({
      contato,
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
      const aluno = this.form.value.aluno!;

      const cobranca: Cobranca = {
        alunoId: aluno.id!,
        alunoNome: `${aluno.nome} ${aluno.sobrenome}`,
        contato: this.form.value.contato!,
        valor: Number(this.form.value.valor),
        vencimento: Timestamp.fromDate(this.form.value.vencimento!),
        pago: false,
      };

      if (this.editando) {
        await this.cobrancasService.editar(
          this.idCobranca!,
          cobranca,
        );
      } else {
        const id = crypto.randomUUID();

        await this.cobrancasService.cadastrar(
          id,
          cobranca,
        );
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Cobrança salva com sucesso.',
      });

      this.form.reset({
        aluno: null,
        contato: '',
        valor: 0,
        vencimento: null,
      });

      this.editando = false;
      this.idCobranca = null;
      this.CadCobrancas = false;
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

  editarCobranca(cobranca: Cobranca) {
    this.editando = true;
    this.idCobranca = cobranca.id!;
    this.CadCobrancas = true;

    const aluno = this.alunos.find((a) => a.id === cobranca.alunoId);

    this.form.patchValue({
      aluno: aluno ?? null,
      contato: cobranca.contato,
      valor: cobranca.valor,
      vencimento: cobranca.vencimento.toDate(),
    });
  }

  async excluirCobranca(cobranca: Cobranca) {
    try {
      await this.cobrancasService.excluir(cobranca.id!);

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Cobrança removida.',
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível excluir.',
      });
    }
  }

  modalExcluir(event: Event, cobranca: Cobranca) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir a cobrança de ${cobranca.alunoNome}?`,
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
        this.excluirCobranca(cobranca);
      },
    });
  }

  async confirmarPagamento() {
    if (!this.proximoVencimento) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Informe o próximo vencimento.',
      });

      return;
    }

    try {
      // Atualiza cobrança atual

      await this.cobrancasService.editar(
        this.cobrancaSelecionada.id!,

        {
          ...this.cobrancaSelecionada,
          pago: true,
          dataPagamento: Timestamp.now(),
        },
      );

      // Cria próxima cobrança

      const nova: Cobranca = {
        alunoId: this.cobrancaSelecionada.alunoId,
        alunoNome: this.cobrancaSelecionada.alunoNome,
        contato: this.cobrancaSelecionada.contato,
        valor: this.cobrancaSelecionada.valor,
        vencimento: Timestamp.fromDate(this.proximoVencimento!),
        pago: false,
      };

      await this.cobrancasService.cadastrar(
        crypto.randomUUID(),
        nova,
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Pagamento confirmado.',
      });

      this.mostrarModalPagamento = false;

      this.proximoVencimento = null;
    } catch (e) {
      console.error(e);
    }
  }

  enviarWhatsapp(cobranca: Cobranca) {
    const telefone = cobranca.contato.replace(/\D/g, '');
    const vencimento = cobranca.vencimento.toDate().toLocaleDateString('pt-BR');
    const mensagem = `Olá, querido aluno/responsável!
    A mensalidade da escola de música encontra-se ${cobranca.pago ? 'PAGA' : 'PENDENTE'}.
    - Aluno: ${cobranca.alunoNome}
    - Valor: ${cobranca.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}
    - Vencimento: ${vencimento}
    - Chave Pix: 68992334405
    - Titular: Escola de Música Doce Melodia / Walef Moura Fernandes
    - Banco: Sicoob

    Obrigado!`;

    window.open(
      `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
      '_blank',
    );
  }

  // filtros
  alunoFiltro: Aluno | null = null;
  statusFiltro: boolean | null = null;

  status = [
    {
      label: 'Pendente',
      value: false,
    },
    {
      label: 'Pago',
      value: true,
    },
  ];
  filtrarCobrancas() {
    this.cobrancasFiltradas = this.cobrancas.filter((cobranca) => {
      const alunoOk = !this.alunoFiltro || cobranca.alunoId === this.alunoFiltro.id;
      const statusOk = this.statusFiltro === null || cobranca.pago === this.statusFiltro;

      return alunoOk && statusOk;
    });
  }
  limparFiltros() {
    this.alunoFiltro = null;
    this.statusFiltro = null;
    this.cobrancasFiltradas = [...this.cobrancas];
  }
}
