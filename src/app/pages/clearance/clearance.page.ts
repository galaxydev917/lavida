import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import { Platform, LoadingController, AlertController, MenuController } from '@ionic/angular';
import { DbService } from '../../services/sqlite/db.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-clearance',
  templateUrl: './clearance.page.html',
  styleUrls: ['./clearance.page.scss'],
})
export class ClearancePage implements OnInit {
  loginedUser : any;
  isLogined = false;
  productList = [];
  loadMore_productList = [];
  img_dir = '';
  from_limitVal = 0;
  placeholder_qty = "";
  qty_dropdownList = [];
  qty_dropdown = "";

  constructor(
    public storageService: StorageService,
    public menuCtrl: MenuController,
    public webview: WebView,
    public file: File,
    public db: DbService,
    private router: Router,

  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.loginedUser = await this.storageService.getObject('loginedUser');
    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'product_img/');

    if(!this.loginedUser){
      this.isLogined = false;
    }else{
      this.isLogined = true;
      this.getProducts(false, "");
    }
  }
  async getProducts(isFirstLoad, event){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){

        this.loadMore_productList = await this.db.loadClearanceProducts(this.loginedUser.group_id, this.from_limitVal);
        for(var i=0; i<this.loadMore_productList.length; i++){
          this.loadMore_productList[i].qty_dropdownList = this.getQtyList(this.loadMore_productList[i]);
          this.loadMore_productList[i].placeholder_qty = this.placeholder_qty;
        }
        for(var i=0; i<this.loadMore_productList.length; i++){
          this.productList.push(this.loadMore_productList[i]);
        }
        if (isFirstLoad)
          event.target.complete();

        this.from_limitVal = this.from_limitVal + 60;  
      }
    });  
  }

  async loadMore(event){
    this.getProducts(true, event);

  }

  changePrice(e, productIndex){
    console.log(productIndex);
    var selectedQty = e.detail.value;
    if(selectedQty >= this.productList[productIndex].productQtySlab)
      this.productList[productIndex].productPrice = this.productList[productIndex].productPriceSlab;
  }
  
  gotoDetail(product){
    let navigationExtras: NavigationExtras = {
      state: {
        product: product
      }
    };    
    this.router.navigate(['/product-detail'], navigationExtras);
  }

  getQtyList(product){
    this.qty_dropdown = "";
    var minQty = product.productMinQty;

    this.placeholder_qty = minQty;
    var qtyList = [];
    for(var i= minQty; i<100; i++){
      if(product.productCartonQty == i)
        this.placeholder_qty = i;

      qtyList.push(i);
      if(i >= product.productCartonQty && product.productCartonQty > 1)
        i += product.productCartonQty;
      else
        i += minQty  
    }
   return qtyList;
  }
  async openMenu() {
    this.loginedUser = await this.storageService.getObject("loginedUser");

    if(this.loginedUser){
      this.menuCtrl.enable(true, 'loggedin_customMenu');
      this.menuCtrl.open('loggedin_customMenu');
    }else{
      this.menuCtrl.enable(true, 'customMenu');
      this.menuCtrl.open('customMenu');
  
    }
  }
  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }
}
