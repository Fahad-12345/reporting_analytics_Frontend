export interface Item {
    id: number;
    priv_title: string;
    priv_key: string;
    display_group: string;
    parent_id: number;
    created_at: string;
    updated_at: string;
    deletedAt: string;
    isDeleted: string;
    type: string;
    icon: string;
    is_checked: boolean;
    link: string;
}
export type Permission = Item;

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
