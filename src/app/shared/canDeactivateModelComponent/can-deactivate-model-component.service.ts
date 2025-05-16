import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomDiallogService } from '../services/custom-dialog.service';
import { RouterLoaderServiceService } from '@appDir/medical-doctor/services/router-loader-service.service';
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateModelComponentService {

  constructor(private customDiallogService: CustomDiallogService,
    public routerLoaderService: RouterLoaderServiceService,) { }
  canDeactivate() {

    let ans = false;
    debugger;
    this.routerLoaderService.isNavigationPending.next(false);
    return this.customDiallogService.confirm('Discard Changes','Are you sure you want to discard the changes made?','Yes','No')
		.then((confirmed) => {
      
			if (confirmed){
        ans = true;	
			}else if(confirmed === false){
        ans = false;
			}else{
         ans = false;
         confirmed = false;
        // confirmed = null;
			}
      return confirmed;
		})
		.catch();
  }
}
