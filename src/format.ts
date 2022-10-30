import dayjs from "dayjs";
import { GitOutput } from "./types";

// 格式化内容
/* 
格式：
  日期
   项目名
    描述
*/
interface logObj {
	[key: string]: {
		[key: string]: GitOutput[];
	};
}
export const formatGitLog = (projectsLogs: GitOutput[] = []) => {
	const logObj: logObj = {};
	for (const log of projectsLogs) {
		const project = log.project;
		const day = dayjs(log.timestamp * 1000).format("YYYY-MM-DD");
		if (!logObj[day]) {
			logObj[day] = {};
		}
		if (!logObj[day][project]) {
			logObj[day][project] = [];
		}
		logObj[day][project].push(log);
	}

	let result = "";

	for (const [day, projects] of Object.entries<{ [key: string]: GitOutput[] }>(
		logObj,
	)) {
		result += `${day}\n`;
		for (const [project, list] of Object.entries(projects)) {
			result += `${project}\n`;
			list.forEach(({ text }) => {
				result += `${text}\n`;
			});
		}
	}
	result += "\n";
	return result;
};
