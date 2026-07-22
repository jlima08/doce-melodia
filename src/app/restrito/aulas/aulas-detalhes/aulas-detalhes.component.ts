import { Component, inject } from '@angular/core';
import { CardPageComponent } from "../../components/card-page/card-page.component";
import { AulasService } from '../../../core/services/aulas.service';
import { Aula } from '../../../core/models/aulas.model';

@Component({
  selector: 'app-aulas-detalhes',
  imports: [CardPageComponent],
  templateUrl: './aulas-detalhes.component.html',
  styleUrl: './aulas-detalhes.component.scss'
})
export class AulasDetalhesComponent {
  private aulasService = inject(AulasService);
  aulas: Aula[] = []
  ngOnInit() {

    this.buscarAulas();  
    
  }
  buscarAulas() {

    this.aulasService
      .listar()
      .subscribe(aulas => {

        this.aulas = aulas;
        

      });

  }

}
