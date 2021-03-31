import { Component, OnInit, Input } from '@angular/core';
import { ModalController, MenuController,  } from '@ionic/angular';
import {StorageService} from '../../services/storage/storage.service';
import { Router} from '@angular/router';

import { LoginPage } from '../../pages/login/login.page';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {

  @Input() pageTitle: string;
  @Input() isLoggedIn: boolean;
  @Input() cartBadgeCount: any;

  constructor(
    public modalController: ModalController,
    public menuCtrl: MenuController,
    public storageService: StorageService,
    public router: Router,

  ) { }

  ngOnInit() {}

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginPage,
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.isLoggedIn = true;
      }
    });

    return await modal.present();
  }
  gotoCart(){
    this.router.navigate(['/cart']);
  }

  logout(){
    this.storageService.removeItem("loginedUser");
    this.menuCtrl.close('loggedin_customMenu');
    this.isLoggedIn = false;
  }

  async openMenu() {

    if(this.isLoggedIn){
      this.menuCtrl.enable(true, 'loggedin_customMenu');
      this.menuCtrl.open('loggedin_customMenu');
      
    }else{
      this.menuCtrl.enable(true, 'customMenu');
      this.menuCtrl.open('customMenu');
  
    }
  }
}
