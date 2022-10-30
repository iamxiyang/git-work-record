import chalk from "chalk";
import clipboard from "clipboardy";

export const copy = (text: string) => {
	clipboard.writeSync(text);
};

export const log = (...text: unknown[]) => {
	console.log(chalk.cyan(text));
};

export const info = (...text: unknown[]) => {
	console.info(chalk.blue(text));
};

export const error = (...text: unknown[]) => {
	console.error(chalk.red("错误：" + text));
};
