export class MdLinks {
	private _link: string;
	private _name: string;
	private _drop: boolean;
	private _hasCarryForwardButton: boolean;
	private _carryForwarded: boolean;
	private _slug: string;

	constructor(mdlink) {
		this.setLinks(mdlink);
	}
	public setLinks(mdlink) {
		if (mdlink) {
			this.link = mdlink.link;
			this.name = mdlink.name;
			this.drop = mdlink.drop;
			this.carryForwarded = mdlink.carryForwarded;
			this.hasCarryForwardButton = mdlink.hasCarryForwardButton;
			this.slug = mdlink.slug;
		}
	}

	public getLinks() {
		return {
			link: this.link,
			name: this.name,
			drop: this.drop,
			carryForwarded: this.carryForwarded,
			hasCarryForwardButton: this.hasCarryForwardButton,
			slug: this.slug,
		};
	}

	public get link(): string {
		return this._link;
	}

	public set link(link: string) {
		this._link = link;
	}

	public get name(): string {
		return this._name;
	}

	public set name(name: string) {
		this._name = name;
	}

	public get drop(): boolean {
		return this._drop;
	}

	public set drop(drop: boolean) {
		this._drop = drop;
	}

	public get carryForwarded(): boolean {
		return this._carryForwarded;
	}

	public set carryForwarded(carryForwarded: boolean) {
		this._carryForwarded = carryForwarded;
	}

	public get hasCarryForwardButton(): boolean {
		return this._hasCarryForwardButton;
	}

	public set hasCarryForwardButton(hasCarryForwardButton: boolean) {
		this._hasCarryForwardButton = hasCarryForwardButton;
	}
	public get slug(): string {
		return this._slug;
	}

	public set slug(slug: string) {
		this._slug = slug;
	}
}
