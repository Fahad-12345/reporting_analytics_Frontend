export class Code {
	private _id: number;
	private _description: string;
	private _name: string;
	private _type: string;

	constructor(code) {
		this.setCode(code);
	}

	public setCode(code) {
		if (code) {
			this.id = code.id;
			this.description = code.description;
			this.name = code.name;
			this.type = code.type;
		}
	}

	public getCode() {
		return {
			id: this.id,
			description: this.description,
			name: this.name,
			type: this.type,
		};
	}

	public get id(): number {
		return this._id;
	}

	public set id(id: number) {
		this._id = id;
	}

	public get description(): string {
		return this._description;
	}

	public set description(description: string) {
		this._description = description;
	}

	public get name(): string {
		return this._name;
	}

	public set name(name: string) {
		this._name = name;
	}

	public get type(): string {
		return this._type;
	}

	public set type(type: string) {
		this._type = type;
	}
}
