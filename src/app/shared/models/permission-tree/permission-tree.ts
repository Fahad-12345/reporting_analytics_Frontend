import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { Permission } from './permission/permission'
export class PermissionTree {
    id: number;
    name: string;
    parent_id: number;
    status: number; //numeric boolean
    created_at: string;
    updated_at: string;
    deleted_at: string;
    permissions: Permission[];
    submenu: PermissionTree[];

    /**
     * Creates an instance of permission tree.
     * @param permissionTree 
     */
    constructor(permissionTree: any) {
        this.setPermissionTree(permissionTree);
    }

    /**
     * Sets permission tree
     * @param permissionTree 
     */
    public setPermissionTree(permissionTree: any) {
        if (permissionTree) {
            this.id = permissionTree.id;
            this.name = permissionTree.name;
            this.parent_id = permissionTree.parent_id;
            this.status = permissionTree.status; //numeric boolean
            this.created_at = permissionTree.created_at;
            this.updated_at = permissionTree.updated_at;
            this.deleted_at = permissionTree.deleted_at;

            let permissions = getObjectChildValue(permissionTree, [], ['permissions']) || [];
            this.permissions = permissions.map((permission: Permission) => {
                return new Permission(permission);

            });

            let submenu = getObjectChildValue(permissionTree, [], ['submenu']) || [];
            this.submenu = submenu.map((submenu: PermissionTree) => {
                return new PermissionTree(submenu);
            });
        }

    }

}
