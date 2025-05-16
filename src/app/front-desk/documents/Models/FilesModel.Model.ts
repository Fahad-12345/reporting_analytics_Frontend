export class FileModel {
    added_by: any; //Find Model of this element
    created_at: Date;
    deleted_at: Date;
    ext: string;  // Can create enums for this in the future.
    file_link: string;
    file_name: string;
    file_title: string;
    folder_id: number;
    id: number;
    is_uploaded: number;  //Naturally a boolean, can be either 1 or 0
    reason_for_not_signed: string;
    reference_id: string;
    reference_type: string; //may need to discuss
    tags: string;
    updated_at: Date
    updated_by: string;
    link: string;
    description: string;
    pre_signed_url:string;
}