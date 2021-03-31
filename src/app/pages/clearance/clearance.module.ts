import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClearancePageRoutingModule } from './clearance-routing.module';

import { ClearancePage } from './clearance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClearancePageRoutingModule
  ],
  declarations: [ClearancePage]
})
export class ClearancePageModule {}
