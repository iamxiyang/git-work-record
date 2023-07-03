import "zx/globals";
import dayjs from "dayjs";
import cliProgress from "cli-progress";
import { checkUpdate, parseArgv } from "./cli";
import { formatGitLog } from "./format";
import { findGitLog, findGitProject } from "./query";
import { Config } from "./types";
import { log, copy, info, error } from "./utils";

// 指定详细程度，改成false禁用zx自动打印的log
$.verbose = false;

// 编程方式时需要一个默认配置，cli时yargs已经处理了默认值
const defaultOptions = {
	author: "",
	committer: "",
	since: 1,
	copy: false,
	deep: 3,
	search: "",
	reverse: false,
	debug: false,
};

const main = async (options: Config = {}, isCli = false) => {
	// 获取参数
	let config = { ...options };

	if (isCli) {
		checkUpdate();
		const argvs = await parseArgv();
		config = { ...argvs };
	} else {
		if (!config.cwd) {
			error("The cwd parameter is missing");
			error("缺少cwd参数，通过编程方式使用时必传");
			return;
		}
		if (config.day && !config.since) {
			config.since = config.day;
		}
		if (config.grep && !config.search) {
			info("推荐使用 search 参数替换 grep 参数，因为 grep 已经不再被支持");
			info(
				"It is recommended to replace the grep parameter with the search parameter because grep is no longer supported",
			);
			config.search = config.grep;
		}
		config = { ...defaultOptions, ...config };
		if (config.since) {
			config.since = isNaN(Number(config.since))
				? config.since
				: `${config.since}days`;
		}
	}

	const progress = new cliProgress.SingleBar(
		{
			format: "[{bar}] {percentage}%",
			stopOnComplete: true,
			clearOnComplete: true,
		},
		cliProgress.Presets.shades_classic,
	);
	progress.start(100, 0);

	const paths = await findGitProject({ deep: config.deep, cwd: config.cwd });
	if (!paths.length) {
		info("没有查询到GIT项目 No GIT project was found");
		progress.stop();
	}

	const changeEvent = (process: number) => {
		progress.update(Math.floor(process));
	};

	const { logs, errors } = await findGitLog({ ...config, paths, changeEvent });
	progress.update(100);
	progress.stop();

	if (!logs.length) {
		info("没有查询到符合的提交记录 No matching submission record was found.");
		return [];
	}

	if (!isCli) {
		return logs;
	}
	const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
	log(`== ${now} 查询完成，以下是结果 ==`);

	const text = formatGitLog(logs);
	log(text);
	config.copy && copy(text);

	if (errors.length) {
		info(
			`警告，本次查询没有指定author或committer，同时Git全局配置中缺少user.name、以下Git项目本地配置中也缺少user.name，本次查询以下项目被忽略：`,
		);
		info(errors.join("\n"));
	}
};

export default main;
