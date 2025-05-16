export class GroupModel {
    id: string;
    name: string;
    group_members: Array<string> = []
    created_at: Date
    updated_at: Date
    deletedAt: Date
    created_by: string;
    updated_by: string;
    users: Array<any>
    constructor(name: string, group_members: Array<string>) {
        this.name = name;
        this.group_members = group_members;
    }
}