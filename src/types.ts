export interface Config {
	since?: string | number;
	day?: string | number; //since的别名
	author?: string;
	committer?: string;
	copy?: boolean;
	deep?: number;
	search?: string;
	grep?: string; //search的别名
	reverse?: boolean;
	debug?: boolean;
	cwd?: string; //需要查询的Git项目根目录，非Cli模式必传，否则可能存在问题
}

export interface FindGitLogOptions extends Config {
	paths?: string[];
	changeEvent?: Function;
}

export interface GitOutput {
	text: string;
	hash: string;
	author: string;
	timestamp: number;
	project: string;
}
