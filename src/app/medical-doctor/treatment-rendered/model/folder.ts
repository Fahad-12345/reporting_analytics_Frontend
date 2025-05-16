export class Folder {
	private _folderId: number;
	private _referenceId: number;
	private _referenceType: string;
	private _fileName: string;
	private _fileTitle: string;
	private _isUploaded: number;
	private _ext: string;
	private _updatedAt: string;
	private _createdAt: string;
	private _id: number;
	private _link: string;

	constructor(folder: any) {
		this.setFolder(folder);
	}

	public setFolder(folder) {
		if (folder) {
			this.folderId = folder.folder_id;
			this.referenceId = folder.reference_id;
			this.referenceType = folder.reference_type;
			this.fileName = folder.file_name;
			this.fileTitle = folder.file_title;
			this.isUploaded = folder.is_uploaded;
			this.ext = folder.ext;
			this.updatedAt = folder.updated_at;
			this.createdAt = folder.created_at;
			this.id = folder.id;
			this.link = folder.link;
		}
	}

	public getFolder() {
		return {
			folder_id: this.folderId,
			reference_id: this.referenceId,
			reference_type: this.referenceType,
			file_name: this.fileName,
			file_title: this.fileTitle,
			is_uploaded: this.isUploaded,
			ext: this.ext,
			updated_at: this.updatedAt,
			created_at: this.createdAt,
			id: this.id,
			link: this.link,
		};
	}

	public get folderId(): number {
		return this._folderId;
	}

	public set folderId(folderId: number) {
		this._folderId = folderId;
	}

	public get referenceId(): number {
		return this._referenceId;
	}

	public set referenceId(referenceId: number) {
		this._referenceId = referenceId;
	}

	public get referenceType(): string {
		return this._referenceType;
	}

	public set referenceType(referenceType: string) {
		this._referenceType = referenceType;
	}

	public get fileName(): string {
		return this._fileName;
	}

	public set fileName(fileName: string) {
		this._fileName = fileName;
	}

	public get fileTitle(): string {
		return this._fileTitle;
	}

	public set fileTitle(fileTitle: string) {
		this._fileTitle = fileTitle;
	}

	public get isUploaded(): number {
		return this._isUploaded;
	}

	public set isUploaded(isUploaded: number) {
		this._isUploaded = isUploaded;
	}

	public get ext(): string {
		return this._ext;
	}

	public set ext(ext: string) {
		this._ext = ext;
	}

	public get updatedAt(): string {
		return this._updatedAt;
	}

	public set updatedAt(updatedAt: string) {
		this._updatedAt = updatedAt;
	}

	public get createdAt(): string {
		return this._createdAt;
	}

	public set createdAt(createdAt: string) {
		this._createdAt = createdAt;
	}

	public get id(): number {
		return this._id;
	}

	public set id(id: number) {
		this._id = id;
	}

	public get link(): string {
		return this._link;
	}

	public set link(link: string) {
		this._link = link;
	}
}
