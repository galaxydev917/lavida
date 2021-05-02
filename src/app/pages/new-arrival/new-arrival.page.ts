import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import {  ToastController } from '@ionic/angular';
import { DbService } from '../../services/sqlite/db.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { config } from 'src/app/config/config';

@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.page.html',
  styleUrls: ['./new-arrival.page.scss'],
})
export class NewArrivalPage implements OnInit {
  loginedUser : any;
  productList = [];
  loadMore_productList = [];
  img_dir = '';
  from_limitVal = 0;
  qty_dropdown = "";
  placeholder_qty = "";
  qty_dropdownList = [];

  pageTitle = 'New Products';
  isLoggedIn = false;
  cartProductList = [];
  selectedQty = 0;
  cartBadgeCount = 0;
  isLoading = false;
  slideOpts = {
    initialSlide: 0,
    speed: 300,
    slidesPerView: 1,
    //autoplay: true,

    freeMode: false
  };
  constructor(
    public storageService: StorageService,
    public webview: WebView,
    public file: File,
    public db: DbService,
    public router: Router,
    public toastController: ToastController
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter(){
    this.loginedUser = await this.storageService.getObject('loginedUser');
    this.cartProductList = await this.storageService.getObject(config.cart_products);
    this.isLoading = true;

    if(this.cartProductList == null){
      this.cartProductList = [];
      this.cartBadgeCount = 0;
    }else
      this.cartBadgeCount = this.cartProductList.length;  

    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'product_img/');
    if(!this.loginedUser){
      this.isLoggedIn = false;
      this.isLoading = false;
    }else{
      this.isLoggedIn = true;
      this.getNewProducts(false, "");
    }

  }
  async getNewProducts(isFirstLoad, event){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){

        this.loadMore_productList = await this.db.loadNewProducts(this.loginedUser.group_id, this.from_limitVal);
        for(var i=0; i<this.loadMore_productList.length; i++){
          this.loadMore_productList[i].qty_dropdownList = this.getQtyList(this.loadMore_productList[i]);
          this.loadMore_productList[i].placeholder_qty = this.placeholder_qty;
          this.loadMore_productList[i].bulkPrice = this.loadMore_productList[i].productPrice;
          this.loadMore_productList[i].image = await this.db.getProductImagesById(this.loadMore_productList[i].productId);
          
          this.productList.push(this.loadMore_productList[i]);
          
        }
        this.isLoading = false;
        if (isFirstLoad)
          event.target.complete();
          
        this.from_limitVal = this.from_limitVal + 30;  
      }
    });  
  }

  async loadMore(event){
    this.getNewProducts(true, event);
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

  async addToCart(product){
    if(this.selectedQty == 0)
      this.selectedQty = product.productMinQty;

    product.qty = this.selectedQty;

    if(product.bulkPrice)
      product.bulkPrice = product.bulkPrice;
    else
      product.bulkPrice = product.productPrice;

    product.amount = product.bulkPrice * product.qty;

    if(this.cartProductList.length > 0){
      var alreadyProductObj = this.cartProductList.find(function(cartProduct, index) {
        if(cartProduct.productId == product.productId){
          cartProduct.qty = cartProduct.qty + product.qty;
          cartProduct.amount = cartProduct.qty * cartProduct.bulkPrice;
          return true;
        }
      });
      if(alreadyProductObj == undefined)
        this.cartProductList.push(product);
    }else
      this.cartProductList.push(product);
      
    await this.storageService.setObject(config.cart_products, this.cartProductList);
    this.cartBadgeCount = this.cartProductList.length;  

    this.showToast();
  }

  changePrice(e, productIndex){
    this.selectedQty = e.detail.value;
    if(this.selectedQty >= this.productList[productIndex].productQtySlab && this.productList[productIndex].productQtySlab > 0)
      this.productList[productIndex].bulkPrice = this.productList[productIndex].productPriceSlab;
    else
      this.productList[productIndex].bulkPrice = this.productList[productIndex].productPrice;
  }

  gotoDetail(product){
    let navigationExtras: NavigationExtras = {
      state: {
        product: product
      }
    };    
    this.router.navigate(['/product-detail'], navigationExtras);
  }
  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }
  showToast() {
    this.toastController.create({
      header: '',
      message: 'Added to Cart sucessfully!',
      position: 'top',
      color: 'dark',
      duration: 1500
    }).then((obj) => {
      obj.present();
    });
  }
}
