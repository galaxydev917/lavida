import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/online/category/category.service';
import { DbService } from '../../services/sqlite/db.service'
import { CustomerService } from '../../services/online/customer/customer.service';
import {StorageService} from '../../services/storage/storage.service';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Platform, LoadingController, AlertController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
  prodcat_maxId : any;
  productCategory_maxId : any;
  loadingCtrl : any;
  isUpdatingCustomer = false;
  loginedUser : any;
  customerIdList = [];
  categorylist = [];
  img_dir = '';
  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private categoryService: CategoryService,
    public db: DbService,
    private webview: WebView,
    private storageService: StorageService,
    private file: File,
    public menuCtrl: MenuController,
    public customerService: CustomerService
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter(){
    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'prod_cat_img/');
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.getCategoryList();
      }
    });  
  }


  async getCategoryList(){
    this.categorylist = await this.db.loadCategories();
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
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
}
