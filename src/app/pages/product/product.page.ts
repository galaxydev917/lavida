import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DbService } from '../../services/sqlite/db.service'
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import {  MenuController } from '@ionic/angular';
import {StorageService} from '../../services/storage/storage.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  isLoading = false;
  category_id : any;
  productlist = [];
  img_dir = '';
  from_limitVal = 0;
  loadMore_productList = [];
  loginedUser : any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public db: DbService,
    private file: File,
    public menuCtrl: MenuController,
    public storageService: StorageService,
    private webview: WebView,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'product_img/');
    this.loginedUser = await this.storageService.getObject('loginedUser');
    this.isLoading = true;
    this.route.params.subscribe(
      data => {
        this.category_id = data.id;
        this.db.getDatabaseState().subscribe(async (res) => {
          if(res){
            this.getProductList();
          }
        });  
      }
    );
  }

  async getProductList(){
    this.productlist = await this.db.loadProducts(this.category_id, this.loginedUser.group_id, this.from_limitVal);
  }

  async loadMore(){
    this.from_limitVal = this.from_limitVal + 6;
    this.loadMore_productList = await this.db.loadProducts(this.category_id, this.loginedUser.group_id, this.from_limitVal);
    for(var i=0; i<this.loadMore_productList.length; i++){
      this.productlist.push(this.loadMore_productList[i]);
    }

  }

  async openMenu() {
    this.menuCtrl.enable(true, 'loggedin_customMenu');
    this.menuCtrl.open('loggedin_customMenu');

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
}
