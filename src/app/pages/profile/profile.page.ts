import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController, AlertController, MenuController } from '@ionic/angular';
import {StorageService} from '../../services/storage/storage.service';
import { DbService } from '../../services/sqlite/db.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  loginedUser : any;
  profileInfo : any;
  validationsform: FormGroup;

  constructor(
    public formBuilder: FormBuilder,

    public menuCtrl: MenuController,
    public storageService: StorageService,
    public db: DbService,
  ) { }

  ngOnInit() {
    this.validationsform = this.formBuilder.group({
      first_name: new FormControl('', Validators.compose([
        Validators.required
      ])),  
      last_name: new FormControl('', Validators.compose([
        Validators.required
      ])),  
      address1: new FormControl('', Validators.compose([
        Validators.required
      ])),    
      address2: new FormControl('', Validators.compose([
        Validators.required
      ])),   
      city: new FormControl('', Validators.compose([
        Validators.required
      ])),  
      post_code: new FormControl('', Validators.compose([
      ])),   
      state: new FormControl('', Validators.compose([
        Validators.required
      ])),   
      tel_phone: new FormControl('', Validators.compose([
        
      ])),   
      mobile_phone: new FormControl('', Validators.compose([
      ])),    
    
      confirm_password: new FormControl('', Validators.compose([
        
      ])),                                      
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6)
      ])),
      company: new FormControl('', Validators.compose([
      ])),   
      position: new FormControl('', Validators.compose([
        Validators.required
      ])),   
      fax: new FormControl('', Validators.compose([
        
      ])),   
      shop_phone: new FormControl('', Validators.compose([
      ])),   
    });

  }

  async ionViewWillEnter(){
    this.db.getDatabaseState().subscribe(async (res) => {
      if(res){
        this.getProfileInfo();
      }
    });  
    
  }

  async getProfileInfo(){
    this.loginedUser = await this.storageService.getObject("loginedUser");
    this.profileInfo = await this.db.getProfileInfo(this.loginedUser);
    this.validationsform.setValue({
      email: this.profileInfo.email,
      password: this.profileInfo.password,
      confirm_password: '',
      first_name: this.profileInfo.first_name,
      last_name: this.profileInfo.last_name,
      post_code: this.profileInfo.post_code,
      tel_phone: this.profileInfo.tel_phone,
      mobile_phone: this.profileInfo.mobile_phone,
      address1: this.profileInfo.address1,
      address2: this.profileInfo.address2,
      city: this.profileInfo.city,
      state: this.profileInfo.state,
      company: this.profileInfo.company,
      position: this.profileInfo.position,
      fax: this.profileInfo.fax,
      shop_phone: this.profileInfo.shop_phone
   });
  }

  async openMenu() {
    this.menuCtrl.enable(true, 'loggedin_customMenu');
    this.menuCtrl.open('loggedin_customMenu');
  }
}
