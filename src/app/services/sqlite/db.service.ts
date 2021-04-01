// db.service.ts

import { Injectable } from '@angular/core';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import {StorageService} from '../storage/storage.service';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { FileTransfer,  FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
@Injectable({
  providedIn: 'root'
})

export class DbService {
  private storage: SQLiteObject;

  images = new BehaviorSubject([]);
  reg_dateList = new BehaviorSubject([]);
  prodcat_maxIdList = new BehaviorSubject([]);
  productCategory_maxIdList = new BehaviorSubject([]);
  maxIdList = new BehaviorSubject([]);
  regdate = [];
  
  reg_date_sqlite: any;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
    private storageService: StorageService,
    private file: File,
    private transfer: FileTransfer,
    private sqliteDbCopy: SqliteDbCopy,
    public loadingController: LoadingController,

  ) {
    this.initialLocalDatabase();
  }

  async initialLocalDatabase() {

    //this.storageService.removeItem('db_exist');

    let db_exist = await this.storageService.getString('db_exist');
    console.log("db_exist", db_exist);

    if(db_exist){
      this.openDatabase();
    }else{  
      this.file.checkDir(this.file.documentsDirectory, 'lavida').then(async(result) => {
        this.downloadAndCopyLocalDB();      
      }).catch(async (err) =>{
        this.file.createDir(this.file.documentsDirectory, 'lavida', true).then(async (res)=>{
          this.downloadAndCopyLocalDB();   
        });
      });
    }  
  }

  async downloadAndCopyLocalDB(){

    await this.file.copyFile(this.file.applicationDirectory + 'www/assets/', 'lavida.db', this.file.documentsDirectory + 'lavida/', 'lavida.db');
    console.log("copyDbFromStorage");

    this.sqliteDbCopy.copyDbFromStorage('lavida.db', 0, this.file.documentsDirectory + 'lavida/lavida.db', false).then(async (res: any) => {
     
      await this.file.removeFile(this.file.documentsDirectory + 'lavida/', 'lavida.db');
      this.storageService.setString('db_exist', 'done');

      this.openDatabase();

    }).catch((error: any) =>{
      console.error(error);
      alert("Failed Create database");
    });
  }

  
  openDatabase(){
    this.sqlite.create({
      name: 'lavida.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      this.storage = db;
      //this.loadImagesFromSqlite();
      console.log("opend local database");
      this.dbReady.next(true);
    });
  }
  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getImagesFromSqlite(): Observable<any[]> {
    return this.images.asObservable();
  }

  getAllGlobalCartSetting(){
    let query = 'SELECT * FROM cartt_settings';

    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            variable_name: data.rows.item(i).variable_name,
            variable_value: data.rows.item(i).variable_value
          });
        }
      }
      return result;
    });
  }

  loadProductImages() {
   let query = 'SELECT DISTINCT images.name, Product.id FROM images, Product WHERE images.ref_id = Product.id AND images.type = 1 AND Product.web_ready = 1';

    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            name: data.rows.item(i).name,
            productId: data.rows.item(i).id
          });
        }
      }
      return result;
    });
  }

  loadCategoryImages() {
   let query = 'SELECT DISTINCT images.name as name FROM images WHERE images.type = 4';

    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            name: data.rows.item(i).name
          });
        }
      }
      return result;
    });
  }
  getLastRegDate(str_query): Promise<any>{
    return this.storage.executeSql(str_query, []).then(res => {
      var  reg_date = '';
      if (res.rows.length > 0) {
        reg_date = res.rows.item(0).reg_date
      }

      return {
        reg_date: reg_date
      }
    });
  }
  getAgentByEmailAndPwd(param): Promise<any> {
    const query = "SELECT * FROM Customer  WHERE email = ? AND password = ? ";
    return this.storage.executeSql(query, [param.email, param.password]).then(res => { 
      return {
        id: res.rows.item(0).id,
        group_id: res.rows.item(0).group_id,
        ship_state: res.rows.item(0).ship_state,
        state: res.rows.item(0).state,
      }
    });
  }
  getProfileInfo(param): Promise<any> {
    console.log(param.id);
    const query = "SELECT * FROM Customer  WHERE id = ? ";
    return this.storage.executeSql(query, [param.id]).then(res => { 
      return {
        id: res.rows.item(0).id,
        first_name: res.rows.item(0).first_name,
        last_name: res.rows.item(0).last_name,
        email: res.rows.item(0).email,
        unit: res.rows.item(0).unit,
        address1: res.rows.item(0).address1,
        address2: res.rows.item(0).address2,
        city: res.rows.item(0).city,
        tel_phone: res.rows.item(0).phone,
        mobile_phone: res.rows.item(0).mobile,
        state: res.rows.item(0).state,
        password: res.rows.item(0).password,
        post_code: res.rows.item(0).zip,
        company: res.rows.item(0).company,
        position: res.rows.item(0).position,
        fax: res.rows.item(0).fax,
        shop_phone: res.rows.item(0).shop_phone,
        payment_method: res.rows.item(0).payment_method,
        business_structure: res.rows.item(0).business_structure,
        abn: res.rows.item(0).abn,
        comment: res.rows.item(0).comment,
        trading_years: res.rows.item(0).trading_years,
        online_business: res.rows.item(0).online_business,
        domain_name: res.rows.item(0).domain_name
      }
    });
  }
  getMaxId(str_query): Promise<any>{
    return this.storage.executeSql(str_query, []).then(res => {
      var  maxId = 0;
      if (res.rows.length > 0) {
        maxId = res.rows.item(0).maxId
      }

      return {
        maxId: maxId
      }
    });
  }

  addToSqlite(insert_query, data){
    return this.storage.executeSql(insert_query, data)
    .then(res => {
      console.log("insert result====", res);
      return res.insertId;
    }); 
  }
  //Delete
  delete(query) {
    return this.storage.executeSql(query)
    .then(res => {
      console.log("delete result====", res);
    }).catch((error: any) =>{
      console.log("delete result====", error);
    });
  }
  
  getCustomersByAgent(query) {

    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            customer_id: data.rows.item(i).user_id
          });
        }
      }
      //this.images.next(result);
      return result;
    });
  }

  getProductImagesById(productId){
    let query = "SELECT * FROM images WHERE type = 1 AND ref_id = " + productId;
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            name: data.rows.item(i).name
          });
        }
      }
      return result;
    });
  }
  //Home page start---------
  loadHomeSlider(){
    let query = "SELECT * FROM images WHERE type = 14 AND ref_id = 1 AND curr_page='index'";
    
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            title: data.rows.item(i).title,
            description: data.rows.item(i).description,
            name: data.rows.item(i).name
          });
        }
      }
      return result;
    });
  }

  //Category page start-----
  loadCategories(){
    let query = "SELECT DISTINCT ProductCategory.category_id as categoryId, images.name, ProdCat.display_title, images.type FROM ProductCategory, ProdCat, images WHERE ProductCategory.category_id = ProdCat.id AND images.ref_id = ProdCat.id AND images.type = 4 AND images.name != 'NULL' ORDER BY ProdCat.display_title";
    
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            category_id: data.rows.item(i).categoryId,
            display_title: data.rows.item(i).display_title,
            categoryimg: data.rows.item(i).name
          });
        }
      }
      return result;
    });
  }

  //Product page start------
  loadProducts(categoryId, group_id, from){
    let query = "SELECT DISTINCT Product.id AS productId, Product.group" + group_id + "_price as productPrice, images.name as productImg, Product.* FROM Product, ProdCat, ProductCategory, images WHERE ProductCategory.product_id = Product.id AND ProductCategory.category_id = ProdCat.id AND Product.parent_id <= 0 AND Product.web_ready = '1' AND ProductCategory.category_id = " +  categoryId + " AND Product.group2_price > 0 AND images.ref_id = Product.id ORDER BY due_date desc, new_product desc, new_date desc, id desc, code limit " + from + ", 6";
    
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            productId: data.rows.item(i).dis_id,
            productPrice: data.rows.item(i).productPrice,
            productName: data.rows.item(i).name,
            productImg: data.rows.item(i).productImg,
            productDimension: data.rows.item(i).dimension,
            productBarCode: data.rows.item(i).barcode,
            productMaterials: data.rows.item(i).materials,
            productMinQty: data.rows.item(i).minimum_qty,
            productCartonQty: data.rows.item(i).FT_CARTON_QTY,
            productWeight: data.rows.item(i).FT_WEIGHT,
            productLength: data.rows.item(i).FT_LENGTH,
            productWidth: data.rows.item(i).FT_WIDTH,
            productHeight: data.rows.item(i).FT_HEIGHT,
            productCode: data.rows.item(i).code,
            productImportantInfo: data.rows.item(i).important_information,
            productDescription: data.rows.item(i).description,
            productShortDescription: data.rows.item(i).short_description,
          });
        }
      }
      return result;
    });
  }
  async loadNewProducts(group_id, from){

    let query = "SELECT DISTINCT `Product`.`id` AS `dis_id`, `Product`.*, Product.group" + group_id + "_price as productPrice FROM `Product`, `ProdCat`,`ProductCategory` WHERE `ProductCategory`.`product_id` = `Product`.`id` AND `ProductCategory`.`category_id` = `ProdCat`.`id` AND Product.web_ready='1' AND Product.parent_id <= '0' AND ProdCat.portal1='1' AND  Product.new_product=1 ORDER BY datetime(due_date) DESC, new_product DESC, datetime(new_date) DESC, id DESC, code LIMIT " + from + ", 30";
    
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            productId: data.rows.item(i).dis_id,
            productPrice: data.rows.item(i).productPrice,
            productName: data.rows.item(i).name,
            productDimension: data.rows.item(i).dimension,
            productBarCode: data.rows.item(i).barcode,
            productMaterials: data.rows.item(i).materials,
            productMinQty: data.rows.item(i).minimum_qty,
            productCartonQty: data.rows.item(i).FT_CARTON_QTY,
            productWeight: data.rows.item(i).FT_WEIGHT,
            productLength: data.rows.item(i).FT_LENGTH,
            productWidth: data.rows.item(i).FT_WIDTH,
            productHeight: data.rows.item(i).FT_HEIGHT,
            productCode: data.rows.item(i).code,
            productImportantInfo: data.rows.item(i).important_information,
            productDescription: data.rows.item(i).description,
            productShortDescription: data.rows.item(i).short_description,
            productQtySlab: data.rows.item(i).qty_slab1,
            productPriceSlab: data.rows.item(i).price_slab1,
            productPreOrder: data.rows.item(i).pre_order,
          });
        }
      }
      return result;
    });
  }
  async loadClearanceProducts(group_id, from){

    let query = "SELECT DISTINCT `Product`.`id` AS `dis_id`, `Product`.*, Product.group" + group_id + "_price as productPrice FROM `Product`, `ProdCat`, `ProductCategory` WHERE `ProductCategory`.`product_id` = `Product`.`id` AND `ProductCategory`.`category_id` = `ProdCat`.`id` AND Product.parent_id <= 0 AND Product.web_ready = '1' AND ProductCategory.category_id = 47 AND Product.group2_price > 0 ORDER BY datetime(due_date) DESC, new_product desc, datetime(new_date) DESC, id desc, code limit " + from + ", 30";
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            productId: data.rows.item(i).dis_id,
            productPrice: data.rows.item(i).productPrice,
            productName: data.rows.item(i).name,
            productDimension: data.rows.item(i).dimension,
            productBarCode: data.rows.item(i).barcode,
            productMaterials: data.rows.item(i).materials,
            productMinQty: data.rows.item(i).minimum_qty,
            productCode: data.rows.item(i).code,
            productImportantInfo: data.rows.item(i).important_information,
            productDescription: data.rows.item(i).description,
            productShortDescription: data.rows.item(i).short_description,
            productQtySlab: data.rows.item(i).qty_slab1,
            productPriceSlab: data.rows.item(i).price_slab1,
          });
        }
      }
      return result;
    });
  }  
  async loadSpecialProducts(group_id, from){

    let query = "SELECT DISTINCT `Product`.`id` AS `dis_id`, `Product`.*, Product.group" + group_id + "_price as productPrice, images.name as productImg FROM `Product`, `ProdCat`, `ProductCategory`, `images` WHERE `ProductCategory`.`product_id` = `Product`.`id` AND `ProductCategory`.`category_id` = `ProdCat`.`id` AND Product.web_ready='1' AND Product.parent_id <= '0' AND ProdCat.portal1='1' AND (Product.group" + group_id + "_special_price > 0 || Product.group"+ group_id +"_special_discount > 0) AND ProdCat.id!='47' AND images.ref_id = Product.id order by due_date desc, new_product desc, new_date desc, id desc, code limit " + from + ", 60";
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            productId: data.rows.item(i).dis_id,
            productPrice: data.rows.item(i).productPrice,
            productName: data.rows.item(i).name,
            productImg: data.rows.item(i).productImg,
            productDimension: data.rows.item(i).dimension,
            productBarCode: data.rows.item(i).barcode,
            productMaterials: data.rows.item(i).materials,
            productMinQty: data.rows.item(i).minimum_qty,
            productCode: data.rows.item(i).code,
            productImportantInfo: data.rows.item(i).important_information,
            productDescription: data.rows.item(i).description,
            productShortDescription: data.rows.item(i).short_description,
            productQtySlab: data.rows.item(i).qty_slab1,
            productPriceSlab: data.rows.item(i).price_slab1,

          });
        }
      }
      return result;
    });
  }    
  //Customer page start----
  loadCustomers(parentId, maxId){
    let query = "SELECT * FROM Customer WHERE status = 2 AND parent_id = " + parentId + " AND id > " + maxId + " LIMIT 20";
    console.log(query);
    return this.storage.executeSql(query, []).then(data => {
      let result = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          result.push({ 
            customerId: data.rows.item(i).id,
            customerParentId: data.rows.item(i).parent_id,
            company: data.rows.item(i).company
          });
        }
      }
      return result;
    });
  }

  //Order page start-----------
    loadOrderMaster(userId){
      let query = "SELECT * FROM OrderMaster WHERE user_id = " + userId + " AND date(order_date) > date('now','-1 years') ORDER BY order_date DESC LIMIT 20";
      console.log(query);
      return this.storage.executeSql(query, []).then(data => {
        let result = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            result.push({ 
              orderDate: data.rows.item(i).order_date,
              orderId: data.rows.item(i).id,
              userId: data.rows.item(i).user_id
            });
          }
        }
        return result;
      });
    }
    loadSavedOrders(userId, from){
      let query = "SELECT * FROM saveordermaster WHERE user_id = " + userId + " AND date(order_date) >= date('now','-1 years') ORDER BY datetime(order_date) DESC LIMIT " + from +  ", 20";
      return this.storage.executeSql(query, []).then(data => {
        let result = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            result.push({ 
              orderDate: data.rows.item(i).order_date,
              orderId: data.rows.item(i).id,
              userId: data.rows.item(i).user_id
            });
          }
        }
        return result;
      });
    }   
    loadSavedOrderDetails(orderId){
      let query = "SELECT * FROM saveorderdetails WHERE order_id = " + orderId ;
      return this.storage.executeSql(query, []).then(data => {
        let result = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            result.push({ 
              orderId: data.rows.item(i).order_id,
              productId: data.rows.item(i).product_id,
              productCode: data.rows.item(i).product_code,
              productQty: data.rows.item(i).qty,
              productPrice: data.rows.item(i).price,
              productName: data.rows.item(i).product_name,
              id: data.rows.item(i).id
            });
          }
        }
        return result;
      });
    }       
}

