import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-page',
  imports: [CommonModule],
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.scss'
})
export class CardPageComponent {
   @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';

}
