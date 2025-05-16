import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, ActivationStart, ChildActivationStart } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators'
@Injectable({
	providedIn: 'root'
})
export class RouterLoaderServiceService {
	routerOutletAction: boolean;
	constructor(private router: Router) {
		// this.router.events.subscribe(event => console.log(event))
		this.router.events.subscribe((event: RouterEvent) => {
			if (event){
			document.getElementById('ovada-body').classList.remove('nav-open');
			if (this.isNavigationStart(event)) {
				this.isNavigationPending.next(true);
			}
			else if (this.isNavigationEnd(event)) {
				this.isNavigationPending.next(false)
			}
		}
		})

		this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(event => {
			if(event['url'] === '/login' || event['url'] ==='/forgot-password'){
				this.routerOutletAction = false;
			}else{
				this.routerOutletAction = true;
			}

			console.log('console', this.routerOutletAction);
        });
	}

	isNavigationPending: BehaviorSubject<boolean> = new BehaviorSubject(false)


	private isConsideredEvent(event: RouterEvent): boolean {
		return this.isNavigationStart(event)
			|| this.isNavigationEnd(event);
	}

	private isNavigationStart(event: RouterEvent): boolean {
		return event instanceof NavigationStart ||
			event instanceof ActivationStart ||
			event instanceof ChildActivationStart;
	}

	private isNavigationEnd(event: RouterEvent): boolean {
		return event instanceof NavigationEnd
			|| event instanceof NavigationCancel
			|| event instanceof NavigationError;
	}
}
