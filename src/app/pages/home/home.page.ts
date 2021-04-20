import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController, AlertController} from '@ionic/angular';
import { CustomerService } from '../../services/online/customer/customer.service';
import { DbService } from '../../services/sqlite/db.service';
import { CategoryService } from '../../services/online/category/category.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import {StorageService} from '../../services/storage/storage.service';
import { config } from 'src/app/config/config';
import { OrderService } from '../../services/online/order/order.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  rowHeight : any;

  isUpdating = false;
  loadingCtrl : any;
  prodcat_maxId : any;
  productCategory_maxId : any;
  img_dir = '';
  cartBadgeCount = 0;

  homeSliders = [];
  loginedUserInfo : any;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true,
    speed: 500
  };
  pageTitle = 'Home';
  isLoggedIn = false;
  cartProductList = [];

  constructor(
    public plt: Platform,
    public loadingController: LoadingController,
    public db: DbService,
    public categoryService: CategoryService,
    public alertController: AlertController,
    public webview: WebView,
    public file: File,
    public storageService: StorageService,
    public customerService: CustomerService,
    public orderService: OrderService,
  ) { }

  ngOnInit() {
    this.rowHeight = this.plt.height() / 2 + 'px';
    this.isUpdating = true; 
    this.syncConfirmAlert();

  }

  async ionViewWillEnter(){
    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'banner_img/');
    this.loginedUserInfo = await this.storageService.getObject("loginedUser");
    
    if(this.loginedUserInfo)
      this.isLoggedIn = true;
    
    this.cartProductList = await this.storageService.getObject(config.cart_products);

    if(this.cartProductList == null){
      this.cartProductList = [];
      this.cartBadgeCount = 0;
    }else
      this.cartBadgeCount = this.cartProductList.length;    
  }


  //Start synced ProdCat table from server.
  async checkExistNewCategory(){
    this.loadingCtrl = await this.loadingController.create({
      message: 'Syncing data...',
    });
    await this.loadingCtrl.present();
    
    var str_prodCatquery = "SELECT MAX(id) as maxId FROM ProdCat LIMIT 1";
    var str_prdductCategoryQuery = "SELECT MAX(id) as maxId FROM ProductCategory LIMIT 1";

    this.prodcat_maxId = await this.db.getMaxId(str_prodCatquery);
    this.productCategory_maxId = await this.db.getMaxId(str_prdductCategoryQuery);

    this.updateCategorySqlite(this.prodcat_maxId.maxId, this.productCategory_maxId.maxId);

  }
  async updateCategorySqlite(prodcat_maxId, productCategory_maxId){
    
    if(prodcat_maxId == null)
      prodcat_maxId = 0;

    if(productCategory_maxId == null)
      productCategory_maxId = 0;
    
    this.categoryService.getProdCatFromServer(prodcat_maxId, productCategory_maxId).subscribe( async (result) => {
      
      if(result.prodcatlist.length > 0)
        await this.addProdCatToSqlite(result.prodcatlist);

      if(result.productCategories.length > 0)
        await this.addProductCategoriesToSqlite(result.productCategories);

      
      this.getSliders();
      this.updateOrderDataFromServer();

    },(err) => {
      this.loadingCtrl.dismiss();
      this.isUpdating = false;
      alert("Error: Sync category data.");

    });
  }

  addProdCatToSqlite(prodcatlist){
    var str_query = "INSERT INTO ProdCat (id, parent_id, name, description, display_title, image) VALUES ";
    
    var rowArgs = [];
    var data = [];
    prodcatlist.forEach(function (prodcat) {
      rowArgs.push("(?, ?, ?, ?, ?, ?)");
      data.push(prodcat.id);
      data.push(prodcat.parent_id);
      data.push(prodcat.name);
      data.push(prodcat.description);
      data.push(prodcat.display_title);
      data.push(prodcat.image);
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);
  }

  addProductCategoriesToSqlite(productCategories){
    var str_query = "INSERT INTO ProductCategory (id, product_id, category_id, product_code) VALUES ";

    var rowArgs = [];
    var data = [];
    productCategories.forEach(function (productCategory) {
      rowArgs.push("(?, ?, ?, ?)");
      data.push(productCategory.id);
      data.push(productCategory.product_id);
      data.push(productCategory.category_id);
      data.push(productCategory.product_code);
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);
  }
  //End synced category table from server.

  async getSliders(){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.homeSliders = await this.db.loadHomeSlider();
      }
    });  

  }

  async updateOrderDataFromServer(){
    var query_saveOrderLastRegdate = "SELECT order_date as reg_date FROM saveordermaster ORDER BY datetime(order_date) DESC LIMIT 1";
    var query_orderLastRegdate = "SELECT order_date as reg_date FROM OrderMaster ORDER BY datetime(order_date) DESC LIMIT 1";

    var saveOrderLastRegDate = await this.db.getLastRegDate(query_saveOrderLastRegdate);
    var OrderLastRegDate = await this.db.getLastRegDate(query_orderLastRegdate);

    this.orderService.getSaveOrderData(saveOrderLastRegDate.reg_date, OrderLastRegDate.reg_date, this.loginedUserInfo.id).subscribe( async (result) => {
      if(result.orderlist.length > 0){
        await this.addOrderMaster(result.orderlist);

        if(result.order_details.length > 0)
          await this.addOrderMasterDetail(result.order_details);
      }  

      if(result.saveorderlist.length > 0){
        await this.addSaveOrder(result.saveorderlist);

        if(result.saveorder_details.length > 0)
          await this.addSaveOrderDetail(result.saveorder_details);
      }

      this.loginedUserInfo =  await this.storageService.getObject("loginedUser"); 

      if(this.loginedUserInfo){
        this.checkCustomerOfAgent();
      }else{
        this.loadingCtrl.dismiss();  
        this.isUpdating = false;
      }
    },(err) => {
    });    

  }
  async addSaveOrder(save_orderlist){

    var str_query = "INSERT INTO saveordermaster (id, order_date, user_id, order_amount, status) VALUES ";

    var rowArgs = [];
    var data = [];
    save_orderlist.forEach(function (save_order) {
      rowArgs.push("(?, ?, ?, ?, ?)");
      data.push(save_order.id);
      data.push(save_order.order_date);
      data.push(save_order.user_id);
      data.push(save_order.order_amount);
      data.push(save_order.status);
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);
  }

  async addSaveOrderDetail(save_orderdetails){

    var str_query = "INSERT INTO saveorderdetails (id, order_id, product_id, qty, price, product_code, product_name) VALUES ";

    var rowArgs = [];
    var data = [];
    save_orderdetails.forEach(function (save_orderdetail) {
      rowArgs.push("(?, ?, ?, ?, ?, ?, ?)");
      data.push(save_orderdetail.id);
      data.push(save_orderdetail.order_id);
      data.push(save_orderdetail.product_id);
      data.push(save_orderdetail.qty);
      data.push(save_orderdetail.price);
      data.push(save_orderdetail.product_code);
      data.push(save_orderdetail.product_name);
  
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);
  }
  addOrderMaster(orderlist){

    var str_query = "INSERT INTO OrderMaster ( id, order_date, user_id, order_amount, status, txn_id, responseText_securepay, distributor_businessName, customer_id) VALUES ";

    var rowArgs = [];
    var data = [];
    orderlist.forEach(function (order) {
      rowArgs.push("(?, ?, ?, ?, ?, ?, ?, ?, ?)");
      data.push(order.id);
      data.push(order.order_date);
      data.push(order.user_id);
      data.push(order.order_amount);
      data.push(order.status);
      data.push(order.txn_id);
      data.push(order.responseText_securepay);
      data.push(order.distributor_businessName);   
      data.push(order.customer_id);      
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);
  }

  addOrderMasterDetail(order_details){
    var str_query = "INSERT INTO OrderDetails (id, order_id, product_id, qty, price, product_code, product_name) VALUES ";

    var rowArgs = [];
    var data = [];
    order_details.forEach(function (order_detail) {
      rowArgs.push("(?, ?, ?, ?, ?, ?, ?)");
      data.push(order_detail.id);
      data.push(order_detail.order_id);
      data.push(order_detail.product_id);
      data.push(order_detail.qty);
      data.push(order_detail.price);
      data.push(order_detail.product_code);
      data.push(order_detail.product_name);
  
    });
    str_query += rowArgs.join(", ");
    console.log(str_query);
    return this.db.addToSqlite(str_query, data);
  }
  async checkCustomerOfAgent(){  

    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        var str_deletequery = "DELETE  FROM Customer WHERE parent_id != " + this.loginedUserInfo.id + " AND id != " + this.loginedUserInfo.id;
        await this.db.delete(str_deletequery);
        
        var str_delete_ordermaster_query = "DELETE FROM OrderMaster  WHERE user_id NOT IN (SELECT id FROM Customer)";
        await this.db.delete(str_delete_ordermaster_query);

        var str_delete_orderdetail_query = "DELETE FROM OrderDetails  WHERE order_id NOT IN (SELECT id FROM OrderMaster)";
        await this.db.delete(str_delete_orderdetail_query);       

        var str_delete_saveordermaster_query = "DELETE FROM saveordermaster  WHERE user_id NOT IN (SELECT id FROM Customer)";
        await this.db.delete(str_delete_saveordermaster_query);

        var str_delete_saveorderdetail_query = "DELETE FROM saveorderdetails  WHERE order_id NOT IN (SELECT id FROM saveordermaster)";
        await this.db.delete(str_delete_saveorderdetail_query);    

        var str_query = "SELECT MAX(id) as maxId FROM Customer WHERE parent_id = " + this.loginedUserInfo.id +  " LIMIT 1";
        var maxCusotmerId = await this.db.getMaxId(str_query);

        this.updateCustomerOfAgent(maxCusotmerId.maxId);
      }
    });

  }

  async updateCustomerOfAgent(maxId){
    if(maxId == null)
      maxId = 0;
    this.customerService.getCustomerByAgent(maxId, this.loginedUserInfo.id).subscribe( async (result) => {

      if(result.data.length > 0){
        await this.addCustomerToSqlite(result.data);
      }
      this.loadingCtrl.dismiss();  
      this.isUpdating = false;
    },
    (err) => {
      this.loadingCtrl.dismiss();
      this.isUpdating = false;
    });
  }

  addCustomerToSqlite(customerlist){

    var str_query = "INSERT INTO Customer (id, distributor_businessName, first_name, last_name, email, password, status, is_sales_rep, parent_id, parent_id_with_data, user_type, custom_zones, cc_number, camtech_trigger_key, reg_date) VALUES ";

    var rowArgs = [];
    var data = [];
    customerlist.forEach(function (customer) {
      rowArgs.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      data = [customer.id, customer.distributor_businessName, customer.first_name, customer.last_name, customer.email, customer.password, customer.status, customer.is_sales_rep, customer.parent_id, customer.user_type, customer.parent_id_with_data, customer.custom_zones, customer.cc_number, customer.camtech_trigger_key, customer.reg_date];
    });
    str_query += rowArgs.join(", ");
    return this.db.addToSqlite(str_query, data);  
  }
  syncConfirmAlert() {
    this.alertController.create({
      header: 'Sync Data',
      message: 'Sync local data from server',
      buttons: [
        {
          text: 'Cancel',
          handler: (data: any) => {
            this.isUpdating = false; 
            this.getSliders();
          }
        },
        {
          text: 'Update',
          handler: (data: any) => {
            console.log('Saved Information', data);
            this.checkExistNewCategory();
          }
        }
      ],
      backdropDismiss: false

    }).then(res => {
      res.present();
    });
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
