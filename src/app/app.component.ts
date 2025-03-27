import { Component } from '@angular/core';
import { ToastComponent } from '@ps/helix';
import { ThemeService } from '@ps/helix';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ToastComponent, RouterModule,],
  templateUrl:'app.component.html',
  styleUrls:['app.component.css']
})


export class AppComponent {
  
  ngOnInit() {
    
  }
  //pour le theme service
  constructor(
    public themeService: ThemeService,
  ) {}
  
}
