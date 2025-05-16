import { FileModel } from "./FilesModel.Model";
import { SelectionModel } from "@angular/cdk/collections";

export class FolderModel {
	added_by: any; //Todo: Find Model of this element
	child: Array<FolderModel>;
	created_at: Date;
	deleted_at: Date;
	files: Array<FileModel>
	folder_description: string;
	folder_name: string;
	facility_qualifier:string;
	facility_location_qualifier:string;
	folder_path: string;
	id: number;
	object_id: number;
	show: boolean;
	isChecked: boolean;
	parent: any; //Todo: Find Model of this element
	updated_at: Date;
	updated_by: Date;
	files_count: number;
	folder_type_id:number;
	isFolderSelected?: boolean;
	selection?: SelectionModel<any>;
	total_files_count: number;
	has_child: boolean;
	is_editable: boolean;
	children_recursive: FolderModel[]
	tree_path: { name: string, id: number ,qualifier:string}[];
	has_file_permission: boolean;
	has_folder_permission: boolean;
}

