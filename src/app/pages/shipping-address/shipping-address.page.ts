import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import { config } from 'src/app/config/config';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Location } from "@angular/common";
import { DbService } from '../../services/sqlite/db.service';
import { Router } from "@angular/router";
import { InAppBrowser, InAppBrowserOptions  } from '@ionic-native/in-app-browser/ngx';
import { CartSettingService } from "../../services/global-carttsetting/cart-setting.service";

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.page.html',
  styleUrls: ['./shipping-address.page.scss'],
})
export class ShippingAddressPage implements OnInit {
  loginedUser : any;
  currentUserProfile : any;
  all_addressText = "";
  cartProductList = [];
  validationsform: FormGroup;
  isShowForm = false;
  isAcceptedTerms = false;
  totalAmount = 0;
  globalSetting: any;

  options : InAppBrowserOptions = {
    location : 'yes',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'yes', //iOS only 
    enableViewportScale : 'no', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    fullscreen : 'yes',//Windows only    
  };

  constructor(
    public storageService: StorageService,
    public location: Location,
    public formBuilder: FormBuilder,
    public router: Router,
    public db: DbService,
    public cartSettingService: CartSettingService,
    public iab: InAppBrowser,
  ) { }

  ngOnInit() {
    this.validationsform = this.formBuilder.group({

      email: new FormControl('', Validators.compose([
        Validators.required,  Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
      ])),
      confirm_email: new FormControl('', Validators.compose([
        Validators.required,  Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
      ])),
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
    this.loginedUser = await this.storageService.getObject("loginedUser");
    this.cartProductList = await this.storageService.getObject(config.cart_products);
    this.globalSetting = this.cartSettingService.globalSetting;
    for (var i = 0; i < this.cartProductList.length; i++) {
      this.totalAmount += this.cartProductList[i].amount;
    }
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.currentUserProfile = await this.db.getProfileInfo(this.loginedUser);
        this.all_addressText = this.currentUserProfile.address1 + " " + this.currentUserProfile.address2 + " " + this.currentUserProfile.city + " " + this.currentUserProfile.state + " " + this.currentUserProfile.zip
        this.setInitialValue();

      }
    });    
  }

  setInitialValue(){
    this.validationsform.setValue({
      email: this.currentUserProfile.email,
      confirm_email: this.currentUserProfile.email,
      first_name: this.currentUserProfile.first_name,
      last_name: this.currentUserProfile.last_name,
      phone: this.currentUserProfile.phone,
      address1: this.currentUserProfile.address1,
      address2: this.currentUserProfile.address2,
      city: this.currentUserProfile.city,
      zip: this.currentUserProfile.zip,
      state: this.currentUserProfile.state,
      country: this.currentUserProfile.country,
      company: this.currentUserProfile.company,
   });
  }
  onCheckboxChange(e){
    if(e.detail.checked){
      this.isShowForm = false;
      this.setInitialValue();
    }
    else
      this.isShowForm = true;
  }
  onCheckTermsAccept(e){
    if(e.detail.checked)
      this.isAcceptedTerms = true;
    else
      this.isAcceptedTerms = false;
  }
  gotoPayment(value){
    console.log(value);
    this.storageService.setObject(config.delivery_addressInfo, value);
    this.router.navigate(["/payment"]);
  }

  openWithSystemBrowser(){
    let target = "_system";
    this.iab.create(config.Url + this.globalSetting.terms_conditions,target,this.options);
  }

  openWithInAppBrowser(){
    let target = "_blank";
    this.iab.create(config.Url + this.globalSetting.terms_conditions,target,this.options);
  }

  back(){
    this.location.back();
  }
}
