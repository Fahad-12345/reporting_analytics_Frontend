import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { CanDeactivateComponentInterface } from './CanDeactivateComponent.interface';
import { Observable } from 'rxjs';
import { CustomDiallogService } from '../services/custom-dialog.service';
import { RouterLoaderServiceService } from '@appDir/medical-doctor/services/router-loader-service.service';
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateFormsComponentService implements CanDeactivate<CanDeactivateComponentInterface> {

  constructor(
    private customDiallogService: CustomDiallogService,
    public routerLoaderService: RouterLoaderServiceService,
    ) { }
  canDeactivate(component: CanDeactivateComponentInterface, curentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // if (!component) {
    //   return true;
	// }
  debugger;
    let bool = component?component.canDeactivate():null;
    let ans;
    this.routerLoaderService.isNavigationPending.next(false);
    if (bool) {
      debugger;
      // return confirm('are you sure you want to leave?')
       ans = this.customDiallogService.confirm('Discard Changes','Are you sure you want to discard the changes made?','Yes','No')
      .then((confirmed) => {
        
        if (confirmed){
          ans = true;
        }else if(confirmed === false){
          ans = false;
        }else{
           ans = false;
        }
        return ans;
      })  
    } else {
      return true;
    }
    return ans;
  }

}
