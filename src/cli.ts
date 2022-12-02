// 解析cli的参数、升级提示
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import updateNotifier from "update-notifier";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = fs.readJSONSync(__dirname + "/../package.json");

// 检测升级
export const checkUpdate = async () => {
  updateNotifier({ pkg }).notify({ isGlobal: true });
};

// 解析参数
export const parseArgv = async () => {
  const argv = await yargs(hideBin(process.argv))
    .help()
    .alias("help", "h")
    .version(pkg.version)
    .options("author", {
      default: "",
      describe: "查询特定作者的提交记录",
    })
    .options("committer", {
      default: "",
      describe: "查询特定提交者的提交记录",
    })
    .options("since", {
      alias: "day",
      default: 1,
      // 格式： ?days , ?weeks , ?years, 2016-11-25，
      // 如果是number则表示?days , 1days 表示展示1天前的提交历史
      describe: "查询特定时间段的提交记录",
    })
    .options("copy", {
      default: false,
      boolean: true,
      describe: "是否自动拷贝内容到剪贴板",
    })
    .options("deep", {
      default: 3,
      describe: "需要递归查询的目录层级",
    })
    .options("search", {
      alias: "grep",
      default: "",
      describe: "提交说明需要包含字符串",
    })
    .options("reverse", {
      default: false,
      boolean: true,
      describe: "是否倒序查询Git提交记录",
    })
    .options("debug", {
      default: false,
      boolean: true,
      describe: "开启debug模式，输出调试",
    }).argv;

  return {
    ...argv,
    since: isNaN(argv.since * 1) ? argv.since : `${argv.since}days`,
  };
};
