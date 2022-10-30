import "zx/globals";
import cliProgress from "cli-progress";
import { checkUpdate, parseArgv } from "./cli";
import { formatGitLog } from "./format";
import { findGitLog, findGitProject } from "./query";
import { Config } from "./types";
import { log, copy, info } from "./utils";

// 指定详细程度，改成false禁用zx自动打印的log
$.verbose = false;

const main = async (options: Config = {}, isCli = false) => {
	// 获取参数
	let config = { ...options };

	if (isCli) {
		checkUpdate();
		const argvs = await parseArgv();
		config = { ...argvs };
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
		info("没有查询到GIT项目");
		progress.stop();
	}

	const changeEvent = (process: number) => {
		progress.update(process);
	};

	const logs = await findGitLog({ ...config, paths, changeEvent });
	progress.update(100);
	progress.stop();

	if (!logs.length) {
		info("没有查询到符合的提交记录");
		return [];
	}

	if (!isCli) {
		return logs;
	}

	const text = formatGitLog(logs);
	log(text);
	config.copy && copy(text);
};

export default main;
