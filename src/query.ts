// 查询git项目、查询git项目日志
import "zx/globals";
import { log, error, info } from "./utils";
import { FindGitLogOptions, GitOutput } from "./types";

// 查询当前目录及其子目录存在 .git 的目录
export const findGitProject = async ({ deep = 3, cwd = "" }) => {
	// 排除一些不可能的目录，减少查询和不必要的错误
	const ignore = [
		"**/System Volume Information/**",
		"**/Thumbs.db/**",
		"**/node_modules/**",
		"**/dist/**",
		"**/build/**",
		"**/bin/**",
		"**/test/**",
		"**/docs/**",
		"**/src/**",
		"**/public/**",
		"**/.idea/**",
		"**/.vscode/**",
		"**/.github/**",
	];
	return glob(["**/.git/HEAD"], {
		cwd,
		absolute: true,
		markDirectories: true,
		deep,
		ignore,
	});
};

// 查询Git项目提交记录
export const findGitLog = async (options: FindGitLogOptions) => {
	const { since, search, paths = [], changeEvent, debug, reverse } = options;
	const projectsLogs: GitOutput[] = [];
	const errorProjects: string[] = [];

	for (let i = 0, len = paths.length; i < len; i++) {
		const p = paths[i];
		// 进入Git项目目录，执行Git命令
		try {
			await within(async () => {
				changeEvent && changeEvent(Math.max((i / len) * 100 - 1, 1).toFixed(2));

				// 进入目录
				const path = p.replace(/\/.git\/HEAD$/, "");
				cd(path);

				debug && log(`进入目录：${path}`);

				// 默认提交作者
				let author = options.author;
				const committer = options.committer;

				if (!author && !options.committer) {
					try {
						author = (await $`git config user.name`).stdout?.trim();
					} catch (err: any) {
						if (err.exitCode && !err.stdout) {
							errorProjects.push(path);
							return;
						}
					}
				}

				debug && log(`使用author：${author}`);
				debug && log(`使用committer：${committer}`);

				// 查询提交记录
				// NOTE:
				// 1. zx执行时如果包含动态参数，会自动添加$'' 符号转义，官方说法是为了安全、转义后在bash 中也是合法的语法，因此不准备去掉这个限制。
				// 2. 因为zx的这个特殊操作，动态变量不需要外层添加引号，而且某些情况下可能影响使用。看社区讨论可以通过 $.quote 暂时去掉限制。
				// 3. 下面的 ___ 其实就是 " ，为什么不直接写成双引号，因为测试时有问题，暂时写成这种不太可能重复的字符，后面再替换回来，是为了方便的处理成json。

				// https://github.com/google/zx/blob/main/docs/quotes.md
				// https://github.com/google/zx/issues/144#issuecomment-859745076
				// https://github.com/google/zx/blob/18f64bc2a791ddbf3626217ba9412c06efb9279b/index.mjs#L240

				const flags = [
					`--since=${since}`,
					`--author=${author}`,
					`--pretty=format:"{___text___:___%s___,___hash___:___%h___,___author___:___%an___,___timestamp___:%ct}"`,
					`--all`,
				];

				if (committer) {
					flags.push(`--committer=${committer}`);
				}

				const _quote = $.quote;
				$.quote = (v) => v;
				const projectLog = (await $`git log ${flags}`).stdout;
				$.quote = _quote;

				debug && log(`SHELL：git log ${flags.join(" ")}`);
				debug && log(`LOG结果：${projectLog}`);

				const project = path.split("/").pop();
				if (projectLog) {
					const logArr: GitOutput[] = projectLog
						// 描述内容的双引号替换为单引号，避免JSON.parse出错
						.replaceAll('"', "'")
						.replace(/___/gm, '"')
						.split("\n")
						.map((line: string) => ({ ...JSON.parse(line), project }))
						.filter(({ timestamp, text }, _index, arr: GitOutput[]) => {
							if (arr.length === 1) return true;
							// 过滤内容（ 参数传递的、重复的（必须是连续提交的重复信息才过滤）  ）
							const last = arr[_index - 1] || { text: "", timestamp: 0 };
							if (search && !text.includes(search)) return false;
							return !(
								Math.abs(last.timestamp - timestamp) < 60 * 60 &&
								last.text === text
							);
						});
					projectsLogs.push(...logArr);
				}
			});
		} catch (err) {
			error(err, p);
		}
	}

	return {
		errors: errorProjects,
		// 根据时间进行排序，正序 倒序
		logs: projectsLogs.sort((a, b) =>
			reverse ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
		),
	};
};
