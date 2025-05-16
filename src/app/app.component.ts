import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { RouterLoaderServiceService } from './medical-doctor/services/router-loader-service.service';
import { ConnectionService, ConnectionState } from 'ng-connection-service';
import { Subscription ,tap} from 'rxjs';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from './shared/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  status = 'ONLINE';
	isConnected ;
	offlineMessage = '';
	refresh = false;
	subscription = new Subscription();
	showLoader:boolean = false;

	constructor(
		private connectionService: ConnectionService,
		private toastrService: ToastrService,
		public routerLoaderService: RouterLoaderServiceService,
		private socket: Socket,
		private loaderService : LoaderService,
		private config: NgbTooltipConfig

	) {
		this.config.openDelay= 70;
		this.config.closeDelay =10;

		this.subscription.add(
			this.connectionService.monitor().pipe(
			  tap((newState: ConnectionState) => {
				this.isConnected = newState.hasInternetAccess;
			if (this.isConnected) {
				this.status = 'ONLINE';
				//  window.location.reload();
			} else {
				this.status = 'OFFLINE';
				this.toastrService.error('No Internet Connection', 'Offline');
			}
			
			  })
			).subscribe()
            
		  );
		  this.subscription.add( this.loaderService.startLoader$.subscribe((loader) =>{
			this.showLoader = loader;
		  }))
           
		  
	
		this.socket.on('NEWBUILDRELEASED', (message) => {
			debugger;
		if(message && message.new_build_release){
			this.refresh = true;
		}
		});
	}
	refreshPage() {
		location.reload();
		
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	  }
}
