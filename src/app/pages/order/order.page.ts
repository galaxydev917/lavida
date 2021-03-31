import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import { DbService } from '../../services/sqlite/db.service'

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  loginedUser : any;
  orderMasterList = [];
  savedOrderList = [];
  order_type : any;
  constructor(
    private storageService: StorageService,
    public db: DbService,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.order_type = 'savedorder';
    this.loginedUser = await this.storageService.getObject("loginedInfo");
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.orderMasterList = await this.db.loadOrderMaster(this.loginedUser.id);
        //this.savedOrderList = await this.db.loadSavedOrders(this.loginedUser.id);
      }
    });  
  }
  segmentChanged(event){
    this.order_type = event.detail.value;
  }
}
