import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoadingComponent } from './loading/loading.component';
import { AppHeaderComponent } from './app-header/app-header.component';

import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    LoadingComponent,
    AppHeaderComponent
  ],
  exports: [
    LoadingComponent,
    AppHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ]
})
export class ComponentsModule { }
