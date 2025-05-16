export class Permission {

    id?: number;
    description?: string;
    is_checked?;
    name;
    show_menu;
}


/**
 * Node for to-do item
 */
export class PermissionItemNode {
    id: number;
    item: string;
    description: string;
    children: PermissionItemNode[];

    selfAndParentPermisson?: number[];
    isChecked?: boolean;
    permissions?: Array<any>;
    submenu?: Array<any>;
    isSelf?: boolean;
}

/** Flat to-do item node with expandable and level information */
export class PermissionItemFlatNode {
    id: number;
    item: string;
    description: string;

    selfAndParentPermisson?: number[];
    level: number;
    expandable: boolean;
    isChecked?: boolean;
    permissions?: Array<any>;
}
