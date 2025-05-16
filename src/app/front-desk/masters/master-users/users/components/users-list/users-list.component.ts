import {Component, OnInit, Input} from '@angular/core';
import {FDServices} from 'app/front-desk/fd_shared/services/fd-services.service';
import {Logger} from '@nsalaun/ng-logger';
import {MainService} from '@shared/services/main-service';
import {Utils} from '@appDir/shared/utils/utils';
import { UserInfoChangeService } from '../../services/user-info-change.service';

@Component({
	selector: 'app-users-list',
	templateUrl: './users-list.component.html',
	styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends Utils implements OnInit {
	@Input() patientRows: any[];
	@Input() totalRows: number;
	public users: any[];

	constructor(private fd_services: FDServices, private logger: Logger, private mainService: MainService,private userInfoChangeService:UserInfoChangeService) {
		super();
	}

	ngOnInit() {
		this.userInfoChangeService.isClickedOnUserPic.next({action:false,id:-1});
		// this.getUsers();
		// this.mainService.setLeftPanel({});
	}

	// getUsers() {
	//   this.fd_services.getUsers().subscribe(res => {
	//     this.logger.log('users', res.data);
	//     if (res.status) {
	//       this.users = res.data;
	//     }
	//   })
	// }

}
