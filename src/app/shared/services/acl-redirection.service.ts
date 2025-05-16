import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Injectable(
	{providedIn: 'root'}
)
export class AclRedirection {
	constructor(
		private router: Router,
		private toastrService: ToastrService,
	) {
	}

	redirectTo(type: string) {
		if (type === 'Unauthorized') {
			this.toastrService.error('User has no permission', 'Error');
			this.router.navigate(['/front-desk']);
		}
	}

}
