export interface Item {
    id: number;
    name: string;
    slug: string;
	parent_id: number;
	status: boolean;
	created_by: number;
	updated_by:number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    icon: string;
}

// export type Permission = Item;


export interface Permission{
	id:number;
	name:string;
	guard_name:string;
	description:string;
	module_id: number;
	is_module:boolean;
	is_self:boolean;
	is_checked: boolean;
	is_hidden: boolean;
	created_by: number;
	updated_by:number;
	created_at:string
	updated_at:string;
	deleted_at: string;
}

export interface MenuItem extends Item {
    permissions?: Permission[];
}
export interface Submenu extends MenuItem {
    submenu?: Menu[];
}

export interface Menu extends MenuItem {
    submenu?: Submenu[];
}

export interface Facilities {
    priv_list: Menu[];
}

export interface Priviliges {
    is_super_admin: boolean;
    facilities: Facilities[];
    priv_ist: Menu[];
    logged_in_facility: Menu[];
}
