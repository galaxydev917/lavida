import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {StorageService} from '../../services/storage/storage.service';
import { config } from 'src/app/config/config';
import { Router } from "@angular/router";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  isShowForm = false;
  validationsform: FormGroup;
  deliveryAddressInfo: any;
  all_addressText = "";

  constructor(
    public location: Location,
    public formBuilder: FormBuilder,
    public storageService: StorageService,
    public router: Router,
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
      zip: new FormControl('', Validators.compose([
        Validators.required
      ])),
      state: new FormControl('', Validators.compose([
        Validators.required
      ])),
      country: new FormControl('', Validators.compose([
        Validators.required
      ])),
      phone: new FormControl('', Validators.compose([
        Validators.required
      ])),
      company: new FormControl('', Validators.compose([
        Validators.required
      ]))             
    });
  }

  async ionViewWillEnter(){
    this.deliveryAddressInfo = await this.storageService.getObject(config.delivery_addressInfo);
    this.setInitialValue();
    this.all_addressText = this.deliveryAddressInfo.address1 + " " + this.deliveryAddressInfo.address2 + " " + this.deliveryAddressInfo.city + " " + this.deliveryAddressInfo.state + " " + this.deliveryAddressInfo.zip

  }

  onCheckboxChange(e){
    if(e.detail.checked)
      this.isShowForm = false;
    else
      this.isShowForm = true;
  }

  setInitialValue(){
    console.log(this.deliveryAddressInfo);
    this.validationsform.setValue({
      first_name: this.deliveryAddressInfo.first_name,
      last_name: this.deliveryAddressInfo.last_name,
      phone: this.deliveryAddressInfo.phone,
      address1: this.deliveryAddressInfo.address1,
      address2: this.deliveryAddressInfo.address2,
      city: this.deliveryAddressInfo.city,
      zip: this.deliveryAddressInfo.zip,
      state: this.deliveryAddressInfo.state,
      country: this.deliveryAddressInfo.country,
      company: this.deliveryAddressInfo.company,
   });
  }
  back(){
    //this.location.back();
    this.router.navigate(["/shipping-address"]);
  }
}
