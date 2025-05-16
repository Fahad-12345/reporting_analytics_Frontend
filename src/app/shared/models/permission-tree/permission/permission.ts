export class Permission {
    id: number;
    name: string;
    guard_name: string;
    description: string;
    module_id: string;
    is_module: number; //numeric boolean
    is_self: number; //numeric boolean
    is_checked: number; //numeric boolean
    is_hidden: number; //numeric boolean
    deleted_at: string;
    created_at: string;
    updated_at: string;

    /**
     * Creates an instance of permission.
     * @param permission 
     */
    constructor(permission: any) {
        this.setPermission(permission);
    }

    /**
     * Sets permission
     * @param permission 
     */
    public setPermission(permission: any) {
        if (permission) {
            this.id = permission.id;
            this.name = permission.name;
            this.guard_name = permission.guard_name;
            this.description = permission.description;
            this.module_id = permission.module_id;
            this.is_module = permission.is_module; //numeric boolean
            this.is_self = permission.is_self; //numeric boolean
            this.is_checked = permission.is_checked; //numeric boolean
            this.is_hidden = permission.is_hidden; //numeric boolean
            this.deleted_at = permission.deleted_at;
            this.created_at = permission.created_at;
            this.updated_at = permission.updated_at;
        }
    }

}
