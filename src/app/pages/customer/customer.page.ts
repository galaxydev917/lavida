import { Component, OnInit } from '@angular/core';
import { DbService } from '../../services/sqlite/db.service'
import {StorageService} from '../../services/storage/storage.service';
import { Platform, LoadingController, AlertController, MenuController } from '@ionic/angular';
import { Router} from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {
  customerlist = [];
  customer_sectionlist = [];
  loginedUser : any;
  maxId = 0;
  constructor(
    private router: Router,
    public db: DbService,
    private storageService: StorageService,
    public menuCtrl: MenuController,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.getCustomerList();
      }
    });  
  }
  loadMore(){
    this.maxId = this.customerlist[this.customerlist.length - 1].customerId;
    this.getCustomerList();
  }
  async getCustomerList(){
    this.loginedUser = await this.storageService.getObject("loginedUser");

    this.customerlist = await this.db.loadCustomers(this.loginedUser.id, this.maxId);
    for( var i=0; i<this.customerlist.length; i++){
      this.customer_sectionlist.push(this.customerlist[i]);
    }
    console.log(this.customer_sectionlist);
  }

  async login(customerId){
    this.storageService.setObject("loginedUser", {id : customerId});
    this.loginedUser = await this.storageService.getObject("loginedUser");
    this.router.navigate(['/profile']);
  }

  async openMenu() {
    this.menuCtrl.enable(true, 'loggedin_customMenu');
    this.menuCtrl.open('loggedin_customMenu');
  }
}
