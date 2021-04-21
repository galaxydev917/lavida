import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CartSettingService } from "../../services/global-carttsetting/cart-setting.service";

@Component({
  selector: 'app-signup-second',
  templateUrl: './signup-second.page.html',
  styleUrls: ['./signup-second.page.scss'],
})
export class SignupSecondPage implements OnInit {
  validationsform: FormGroup;
  countryList = [];
  stateList = [];
  isDropBoxForState = false;

  constructor(
    public formBuilder: FormBuilder,
    public cartSettingService: CartSettingService,
  ) { }

  ngOnInit() {
    this.validationsform = this.formBuilder.group({
      first_name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      last_name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      address1: new FormControl('', Validators.compose([
        Validators.required
      ])),
      address2: new FormControl('', Validators.compose([
        Validators.required
      ])),
      city: new FormControl('', Validators.compose([
        Validators.required
      ])),
      post_code: new FormControl('', Validators.compose([
        Validators.required
      ])),
      state: new FormControl('', Validators.compose([
        Validators.required
      ])),
      countrykey: new FormControl('', Validators.compose([
        Validators.required
      ]))         
    });
  }
  async ionViewWillEnter(){
    this.countryList = this.cartSettingService.countryList;
    this.stateList = this.cartSettingService.states_au;
  }
  changeCountry(e){
    var countryVal = e.detail.value;
    if(countryVal == 463)
      this.isDropBoxForState = true;
    else
      this.isDropBoxForState = false;
  }
}
