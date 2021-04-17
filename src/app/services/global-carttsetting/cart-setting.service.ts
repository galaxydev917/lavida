import { Injectable } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class CartSettingService {
  globalSetting : any;
  loggedInUser : any;

  constructor(
    public storageService: StorageService,
  ) { }

  async setGlobalInfo(cartSettingList){
    console.log("setGlobalInfo");
    this.loggedInUser = await this.storageService.getObject('loginedUser');
    this.globalSetting = this.getGlobalCarttSetting(cartSettingList);
  }

  getGlobalCarttSetting(cartSettingList){
    var minimum_order_state, minimum_order_state_value, minimum_order, amount_alert_threshold, amount_alert_ceiling,amount_alert_pre_text, amount_alert_text, amount_alert_post_text, terms_conditions;

    for( var i=0; i<cartSettingList.length; i++){
      if(cartSettingList[i].variable_name == 'minimum_order_state'){
        console.log(cartSettingList[i])
        minimum_order_state = JSON.parse(cartSettingList[i].variable_value);
      }
      if(cartSettingList[i].variable_name == 'minimum_order'){
        minimum_order = cartSettingList[i].variable_value;
      }    
      if(cartSettingList[i].variable_name == 'cart_amount_alert_threshold'){
        amount_alert_threshold = cartSettingList[i].variable_value;
      }   
      if(cartSettingList[i].variable_name == 'cart_amount_alert_ceiling'){
        amount_alert_ceiling = cartSettingList[i].variable_value;
      }     
      if(cartSettingList[i].variable_name == 'cart_amount_alert_pre_text'){
        amount_alert_pre_text = cartSettingList[i].variable_value;
      }   
      if(cartSettingList[i].variable_name == 'cart_amount_alert_text'){
        amount_alert_text = cartSettingList[i].variable_value;
      }     
      if(cartSettingList[i].variable_name == 'cart_amount_alert_post_text'){
        amount_alert_post_text = cartSettingList[i].variable_value;
      }   
      if(cartSettingList[i].variable_name == 'terms_conditions'){
        terms_conditions = cartSettingList[i].variable_value;
      }                             
    }
    var state = this.loggedInUser.ship_state ? this.loggedInUser.ship_state : this.loggedInUser.state;
    for(var k in minimum_order_state){
      if(k == state)
        minimum_order_state_value = minimum_order_state[k];
    }

    if(!minimum_order_state_value)
      minimum_order_state_value = minimum_order.split(",")[this.loggedInUser.group_id];  

    return {
      minimum_order: minimum_order_state_value,
      amount_alert_threshold: amount_alert_threshold,
      amount_alert_ceiling: amount_alert_ceiling,
      amount_alert_pre_text: amount_alert_pre_text,
      amount_alert_text: amount_alert_text,
      amount_alert_post_text: amount_alert_post_text,
      terms_conditions: terms_conditions
    }
  }
}
