import { Permission } from './permission.model';
import { subMenu } from './submenu.model';

export class Menu {

    id?:number;
    name?:string;
    show_menu?;
    permissions:Permission[];
    submenu:subMenu[];
    
}