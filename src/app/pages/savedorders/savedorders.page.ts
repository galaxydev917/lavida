import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import { DbService } from '../../services/sqlite/db.service'
import { config } from 'src/app/config/config';

@Component({
  selector: 'app-savedorders',
  templateUrl: './savedorders.page.html',
  styleUrls: ['./savedorders.page.scss'],
})
export class SavedordersPage implements OnInit {
  loginedUser : any;
  savedOrderList = [];
  savedOrderDetails = [];
  pageTitle = 'Saved Orders';
  isLoggedIn = false;
  cartProductList = [];
  cartBadgeCount = 0;
  loadMore_OrderList = [];
  from_limitVal = 0;

  constructor(
    public storageService: StorageService,
    public db: DbService,

  ) { }

  ngOnInit() {

  }
  async ionViewWillEnter(){

    this.loginedUser = await this.storageService.getObject("loginedUser");
    console.log(this.loginedUser);
    this.from_limitVal = 0;
    this.savedOrderList = [];

    this.getSavedOrders(false, "");

    this.cartProductList = await this.storageService.getObject(config.cart_products);

    if(this.cartProductList == null){
      this.cartProductList = [];
      this.cartBadgeCount = 0;
    }else
      this.cartBadgeCount = this.cartProductList.length;  
  }

  async getSavedOrders(isFirstLoad, event){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){

        this.loadMore_OrderList = await this.db.loadSavedOrders(this.loginedUser.id, this.from_limitVal);
        for(var i=0; i<this.loadMore_OrderList.length; i++){
          this.savedOrderList.push(this.loadMore_OrderList[i]);
        }
        if (isFirstLoad)
          event.target.complete();

        this.from_limitVal = this.from_limitVal + 20;  
      }
    });  
  }

  async loadMore(event){
    console.log("aaaaaaa");
    this.getSavedOrders(true, event);
  }

  async getSavedOrderDetails(order){
    this.savedOrderDetails = await this.db.loadSavedOrderDetails(order.orderId);
    console.log(this.savedOrderDetails);
  }
}
