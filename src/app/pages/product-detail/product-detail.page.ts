import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Location } from "@angular/common";
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import * as JsBarcode from "JsBarcode";

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product : any;
  img_dir = '';
  slideOpts = {
    initialSlide: 0,
    speed: 300,
    slidesPerView: 1,
    autoplay: true,
    freeMode: false
  };

  @ViewChild('barCode') barCode: ElementRef;

  constructor(
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    public file: File,
    public webview: WebView,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.product = this.router.getCurrentNavigation().extras.state.product;
        console.log(this.product);
      }
    });

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.generateBarcode(this.product.productBarCode); 

    }, 1000);
  }
  ionViewWillEnter(){
    this.img_dir = this.pathForImage(this.file.documentsDirectory + 'product_img/');

  }
  generateBarcode(barcodeValue){
    JsBarcode(this.barCode.nativeElement, barcodeValue,
      {
        displayValue: false
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
  back(){
    this.location.back();
  }
}
