export class PermissionModel {
    id: number
    name: string
    slug: string
    parent_id: number
    status: boolean
    created_at: Date
    updated_at: Date
    deleted_at: Date
    submenu: PermissionModel[]
    permissions: permission[]
}

export class permission {
    id: number
    name: string
    guard_name: string
    description: string
    module_id: number
    is_module: boolean
    is_self: boolean
    is_checked: boolean
    is_hidden: boolean
    deleted_at: Date
    created_at: Date
    updated_at: Date
}