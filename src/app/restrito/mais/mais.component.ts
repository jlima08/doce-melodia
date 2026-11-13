import { Component } from '@angular/core';
import { CardPageComponent } from '../components/card-page/card-page.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mais',
  imports: [CardPageComponent, RouterLink],
  templateUrl: './mais.component.html',
  styleUrl: './mais.component.scss'
})
export class MaisComponent {

}
