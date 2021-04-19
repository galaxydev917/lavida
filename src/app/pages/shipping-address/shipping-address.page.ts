import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import { config } from 'src/app/config/config';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Location } from "@angular/common";
import { DbService } from '../../services/sqlite/db.service';
import { Router } from "@angular/router";
import { InAppBrowser, InAppBrowserOptions  } from '@ionic-native/in-app-browser/ngx';
import { CartSettingService } from "../../services/global-carttsetting/cart-setting.service";
import { AlertController, LoadingController, ToastController } from "@ionic/angular";
import { ExportService } from "../../services/online/export/export.service";

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
  comments = "";
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
    public toastController: ToastController,
    public loadingController: LoadingController,
    public iab: InAppBrowser,
    public exportService: ExportService,
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

  async submit(value){

    var dt = new Date();
    var order_date = `${dt.getFullYear().toString().padStart(4, "0")}-${(
      dt.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${dt
      .getDate()
      .toString()
      .padStart(2, "0")} ${dt
      .getHours()
      .toString()
      .padStart(2, "0")}:${dt
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${dt.getSeconds().toString().padStart(2, "0")}`;

    await this.checkoutOrderMaster(order_date, value);
    this.showToast("Your Order submitted successfully");
    this.exportCheckoutOrdersToOnline(order_date, value);
  }

  async checkoutOrderMaster(order_date, value) {
    var str_maxIdQuery = "SELECT MAX(id) as maxId FROM OrderMaster LIMIT 1";
    var obj_maxId = await this.db.getMaxId(str_maxIdQuery);
    var insertId = obj_maxId.maxId+1;

    var str_query =
      "INSERT INTO OrderMaster ( id, order_date, user_id, order_amount, comments, ship_email, ship_first_name, ship_last_name, ship_phone, ship_address1, ship_address2, ship_city, ship_zip, ship_state, ship_country, ship_company) VALUES ";

    var rowArgs = [];
    var data = [];
    rowArgs.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    data = [insertId, order_date, this.loginedUser.id, this.totalAmount, this.comments, value.confirm_email, value.first_name, value.last_name, value.phone, value.address1, value.address2, value.city, value.zip, value.state, this.currentUserProfile.countrykey, value.company];

    str_query += rowArgs.join(", ");
    await this.db.addToSqlite(str_query, data);

    this.checkoutOrderDetails(insertId);
  } 

  async checkoutOrderDetails(insertedMasterId) {
    var str_maxIdQuery = "SELECT MAX(id) as maxId FROM OrderDetails LIMIT 1";
    var obj_maxId = await this.db.getMaxId(str_maxIdQuery);
    var insertId = obj_maxId.maxId + 1;

    var str_query =
      "INSERT INTO OrderDetails (id, order_id, product_id, qty, price, product_code, product_name) VALUES ";
    var rowArgs = [];
    var data = [];
    this.cartProductList.forEach(function (cartproduct) {
      rowArgs.push("(?, ?, ?, ?, ?, ?, ?)");
      data.push(insertId);
      data.push(insertedMasterId);
      data.push(cartproduct.productId);
      data.push(cartproduct.qty);
      data.push(cartproduct.bulkPrice);
      data.push(cartproduct.productCode);
      data.push(cartproduct.productName);
      insertId = insertId + 1;
    });
    str_query += rowArgs.join(", ");
    return await this.db.addToSqlite(str_query, data);
  } 

  async exportCheckoutOrdersToOnline(order_date, value){
    await this.wait(1000); 

    const loading = await this.loadingController.create({
      message: "Exporting to Online..."
    });
    await loading.present();
    value.order_date = order_date;
    value.user_id = this.loginedUser.id;
    value.order_amount = this.totalAmount;
    value.countrykey = this.currentUserProfile.countrykey;
    value.comments = this.comments;
    
    this.exportService.checkoutOrderMaster({ orderMasterInfo: value }).subscribe(async result => {
      this.exportService.checkoutOrderDetail({ orderMasterId: result.insertedId, orderDetailInfo: this.cartProductList }).subscribe(async result => {
        this.storageService.removeItem(config.cart_products);
        this.cartProductList = [];
        loading.dismiss();
        this.router.navigate(["/thankyou"]);
        
      },err => {
        loading.dismiss();
        alert("Error: Export save order detail data.");

      });
    },err => {
      loading.dismiss();
      alert("Error: Export save order master data.");
    });
  }  
   wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}
  gotoPayment(value){
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
  showToast(msg) {
    this.toastController
      .create({
        header: "",
        message: msg,
        position: "top",
        color: "dark",
        duration: 1500
      })
      .then(obj => {
        obj.present();
      });
  }
}
