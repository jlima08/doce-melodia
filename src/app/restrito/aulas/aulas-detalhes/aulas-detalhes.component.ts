import { Component, inject } from '@angular/core';
import { CardPageComponent } from "../../components/card-page/card-page.component";
import { AulasService } from '../../../core/services/aulas.service';
import { Aula } from '../../../core/models/aulas.model';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Presenca } from '../../../core/models/presenca.model';
import { PresencasService } from '../../../core/services/presencas.service';
import { InputText } from "primeng/inputtext";
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-aulas-detalhes',
  imports: [CardPageComponent, InputText, CommonModule, ButtonModule, TableModule, ConfirmDialogModule, Toast],
  templateUrl: './aulas-detalhes.component.html',
  styleUrl: './aulas-detalhes.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class AulasDetalhesComponent {
   private route = inject(ActivatedRoute);
  private aulasService = inject(AulasService);
  private presencasService = inject(PresencasService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService)

  aula?: Aula;

  presencas: Presenca[] = [];

  loading = false;

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.buscarAula(id);

    this.buscarPresencas(id);
    

  }

  buscarAula(id: string) {

    this.aulasService
      .buscarPorId(id)
      .subscribe({

        next: aula => {

          this.aula = aula;

        },

        error: erro => {

          console.error(erro);

        }

      });

  }

  buscarPresencas(id: string) {

    this.presencasService
      .listarPorAula(id)
      .subscribe({

        next: presencas => {

          this.presencas = presencas;

        },

        error: erro => {

          console.error(erro);

        }

      });

  }

  async marcarAula() {

    if (!this.aula) return;

    const hoje = new Date().toDateString();

    const jaMarcouHoje = this.presencas.some(p =>
      p.dataHora.toDate().toDateString() === hoje
    );

    if (jaMarcouHoje) {

      this.messageService.add({

        severity: 'warn',

        summary: 'Atenção',

        detail: 'A aula de hoje já foi registrada.'

      });

      return;

    }

    this.loading = true;

    try {

      await this.presencasService.marcar(

        this.aula.id!,

        this.aula.professorId,

        this.aula.alunoId

      );

      this.messageService.add({

        severity: 'success',

        summary: 'Sucesso',

        detail: 'Presença registrada.'

      });

    } catch (erro) {

      console.error(erro);

      this.messageService.add({

        severity: 'error',

        summary: 'Erro',

        detail: 'Não foi possível registrar a presença.'

      });

    } finally {

      this.loading = false;

    }

  }

   modalCheck(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja confirmar a presença do aluno(a)  ?`,
      header: 'Confirmar aula',
      icon: 'pi pi-exclamation-triangle',

      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'danger',
        outlined: true,
      },

      acceptButtonProps: {
        label: 'Check',
        severity: 'secondary',
        icon: 'pi pi-headphones',
      },

      accept: () => {
        this.marcarAula();
      },
    });
  }

}
