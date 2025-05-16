export class HashTag {
    constructor(
        public hash_tag_name: string,
        public description: string,
        public hash_tag_id?: number,
        public created_at?: string,
        public updated_at?: string) { }
}

export class HashTagCategory {
    constructor(
        public name: string,
        public description: string,
        public created_at: string,
        public updated_at: string,
        public deleted_at: string) { }
}