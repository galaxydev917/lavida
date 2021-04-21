import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupSecondPageRoutingModule } from './signup-second-routing.module';

import { SignupSecondPage } from './signup-second.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupSecondPageRoutingModule
  ],
  declarations: [SignupSecondPage]
})
export class SignupSecondPageModule {}
