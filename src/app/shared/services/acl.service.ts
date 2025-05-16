import { Injectable,  } from '@angular/core';
import { Router } from '@angular/router';
import { Menu, Submenu, Priviliges } from '../layouts/navbar/navbar.model';
import { AclRedirection } from './acl-redirection.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from './request.service';
import { ToastrService } from 'ngx-toastr';


export type Node = Menu | Submenu;

export interface Levels {
    FIRST: number;
    SECOND: number;
    THIRD: number;
}
export const LEVELS: Levels = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3
};



@Injectable({ providedIn: 'root' })
export class AclService {

    private url: string;
    private validUrls = ['front-desk', 'pages/login'];
    private permissions: Array<string>;
    private isSuperAdmin: boolean;
	private subscription = [];
	loadSpin:boolean=false;

    constructor(
		private requestService: RequestService,
		private toasterService: ToastrService,
        private _router: Router,
        private aclRedirection: AclRedirection,
        private storageData: StorageData) {
        this.subscription.push(
            this.storageData.getPermissionsBehaviorSubject().subscribe((permissions) => {
                this.permissions = permissions;
            })
        );
        this.isSuperAdmin = this.storageData.isSuperAdmin();
        // ;

        // this.permissionObj = { ...this.createObjOf(this.getSubmenu()), ...this.createObjOf(this.getPermissions()) };
        // console.log(this.permissionObj);
        // alert();
        // this._router.events.subscribe((event: Event) => {

        //     if (event instanceof NavigationEnd) {
        //         this.fetchMenu();
        //         this.formatUrl();
        //         console.log('url', this.url, this.getSubmenu().find(prev => prev.link === 'manual-specialities/{id}'));
        //         if (!this.validUrls.includes(this.url)) {
        //             // Below code is commented for now. But needed. 
        //             // if (!this.isValidRequest()) {
        //             //     return this.aclRedirection.redirectTo('Unauthorized');
        //             //     console.log('uUnauthorizedn');
        //             // }
        //         }
        //     }
        // });

	}

    public getSubMenuOf(url) {
        const obj = this.getSubmenu().find(row => row.link === url);

        if (!obj || !Object.keys(obj).length) {
            return [];
        }

        return obj['submenu'].filter(menu => menu['is_checked'] === true);

    }

    private isValidRequest(): boolean {
        return this.findFromMenu()
            ? true
            : this.findFromPermissions();

        // if (this.firstLevel() && Object.keys(this.firstLevel()).length) {
        //     console.log('[validatedAt 1]');
        //     return true;
        // } else if (this.secondLevel() && Object.keys(this.secondLevel()).length) {
        //     console.log('[validatedAt 2]');
        //     return true;
        // } else if (this.thirdLevel() && Object.keys(this.thirdLevel()).length) {
        //     return true;
        // } else {
        //     return this.validateFromPermissions();
        // }
    }

    private getPermissions() {
        const subMenuPermissions = this.flatMapOf(this.getSubmenu(), 'permissions');
        const sSubMenuPermissions = this.flatMapOf(subMenuPermissions, 'permissions');
        return [...subMenuPermissions, ...sSubMenuPermissions];
    }

    public hasPermission(key) {
        // ;
        if (this.isSuperAdmin) {
            return true;
        }

        let permissions = this.permissions;
        if (!permissions.length) {
            permissions = this.storageData.getPermissions();
            (permissions.length) ? this.storageData.setPermissionsBehaviorSubject(permissions) : this.storageData.setPermissionsBehaviorSubject([]);
        }

        return (permissions.includes(key));
    }

    public fetchMenu(): Menu[] {
        // const privileges: Priviliges = this.storageData.get as Priviliges;
        const privileges: Priviliges = JSON.parse(localStorage.getItem('privileges')) as Priviliges;
        let userPermission: Menu[];
        if (privileges) {
            const { is_super_admin, facilities, priv_ist } = privileges;
            userPermission = is_super_admin ? priv_ist : facilities[0].priv_list;
        }
        return userPermission;
    }

    private findFromMenu() {
        const foundFromMenu = this.getSubmenu().find(prev => prev.link === this.url);
        return foundFromMenu && Object.keys((foundFromMenu)).length > 0;
    }

    private findFromPermissions() {
        const foundFromPermission = this.getPermissions().find(prev => prev.link === this.url);
        return foundFromPermission && Object.keys((foundFromPermission)).length > 0;
    }

    private getSubmenu() {
        const submenu = this.flatMapOf(this.fetchMenu(), 'submenu');
        const ssMenu = this.flatMapOf(submenu, 'submenu');
        const sssMenu = this.flatMapOf(ssMenu, 'submenu');
        return (this.fetchMenu()) ? [...this.fetchMenu(), ...submenu, ...ssMenu, ...sssMenu] : [];
    }

    private formatUrl() {
        this.url = this._router.url.replace(/^\//g, '');
        this.url = this.url.replace(/\d+/g, '{id}');
    }


    private flatMapOf(_data: Menu[], key) {
        // console.log(`${key}_data`, _data);
        if (!_data || !_data.length) {
            return [];
        }

        return _data
            .reduce((acc, c) => {
                const submenu = c[`${key}`];

                if (submenu && submenu.length) {
                    return [...acc, ...submenu];
                }

                return acc;
            }, []);
    }

}
