import { Component, inject } from '@angular/core';
import { AlunosService } from '../../core/services/alunos.service';
import { combineLatest } from 'rxjs';
import { Aula } from '../../core/models/aulas.model';
import { AulasService } from '../../core/services/aulas.service';
import { ProfessoresService } from '../../core/services/professores.service';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { CardPageComponent } from '../components/card-page/card-page.component';
import { PresencasService } from '../../core/services/presencas.service';

@Component({
  selector: 'app-dashboard',
  imports: [TagModule, CardModule, ChartModule, CommonModule, CardPageComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  private alunosService = inject(AlunosService);
  private professoresService = inject(ProfessoresService);
  private aulasService = inject(AulasService);
  private presencasService = inject(PresencasService);

  totalAlunos = 0;
  totalProfessores = 0;
  totalAulas = 0;

  instrumentosResumo: {
    instrumento: string;
    quantidade: number;
  }[] = [];

  aulasPorDiaSemana: {
    dia: string;
    quantidade: number;
  }[] = [];

  chartData: any;
  chartOptions: any;
  anoAtual = new Date().getFullYear();

  totalAulasConfirmadasAno = 0;
  totalReposicoesAno = 0;

  ngOnInit() {
    this.carregarDashboard();
  }

  carregarDashboard() {
    combineLatest([
      this.alunosService.listar(),
      this.professoresService.listar(),
      this.aulasService.listar(),
      this.presencasService.listarPorAno(this.anoAtual)
    ]).subscribe(([alunos, professores, aulas, presencas]) => {

      this.totalAlunos = alunos.length;
      this.totalProfessores = professores.length;
      this.totalAulas = aulas.length;

       this.totalAulasConfirmadasAno = presencas.length;

      this.totalReposicoesAno = presencas.filter(
        presenca => presenca.reposicao
      ).length;

      this.instrumentosResumo = this.calcularAlunosPorInstrumento(aulas);
      this.aulasPorDiaSemana = this.calcularAulasPorDiaSemana(aulas);

      this.montarGraficoInstrumentos();
      

    });
  }

  calcularAlunosPorInstrumento(aulas: Aula[]) {
    const mapa = new Map<string, Set<string>>();

    aulas.forEach(aula => {
      if (!aula.instrumento || !aula.alunoId) return;

      const instrumento = aula.instrumento.trim();

      if (!mapa.has(instrumento)) {
        mapa.set(instrumento, new Set<string>());
      }

      mapa.get(instrumento)?.add(aula.alunoId);
    });

    return Array.from(mapa.entries())
      .map(([instrumento, alunos]) => ({
        instrumento,
        quantidade: alunos.size
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  montarGraficoInstrumentos() {
    this.chartData = {
      labels: this.instrumentosResumo.map(item => item.instrumento),
      datasets: [
        {
          label: 'Alunos',
          data: this.instrumentosResumo.map(item => item.quantidade),
          borderWidth: 1
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.raw} aluno(s)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    };
  }

  calcularAulasPorDiaSemana(aulas: Aula[]) {
  const ordemDias = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
  ];

  const mapa = new Map<string, number>();

  ordemDias.forEach(dia => {
    mapa.set(dia, 0);
  });

  aulas.forEach(aula => {
    if (!aula.diaSemana) return;

    const dia = aula.diaSemana.trim();

    mapa.set(dia, (mapa.get(dia) ?? 0) + 1);
  });

  return Array.from(mapa.entries())
    .map(([dia, quantidade]) => ({
      dia,
      quantidade
    }))
    .filter(item => item.quantidade > 0);
}

}
