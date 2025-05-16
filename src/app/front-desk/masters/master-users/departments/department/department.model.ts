export class Department {
	constructor(
		public name: string,
		public description: string,
		public id?: number,
		public created_at?: string,
		public createdBy?: number,
		public updated_at?: string) { }
}
