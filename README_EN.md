# git-work-record

English | [简体中文](./README.md)

Submit records through Git to write daily, weekly and monthly reports.

<div>
  <img src="https://img.shields.io/npm/v/git-work-record?style=for-the-badge" alt="version">
  <img src="https://img.shields.io/github/stars/iamxiyang/git-work-record?style=for-the-badge" alt="stars">
  <img src="https://img.shields.io/github/issues/iamxiyang/git-work-record?style=for-the-badge" alt="issues">
  <img src="https://img.shields.io/npm/l/git-work-record?style=for-the-badge" alt="licence">
</div>

## Upgrade Instructions

> If you have used v1.x before, please note that v2 has the following changes compared with v1：

1. Discarded parameters `style`, `markdown，Can` be realized by programming.
1. `grep` was renamed to search and looked up through JS instead.
1. The implementation of the parameter `reverse` is changed to sort the content through JS.
1. If the information submitted continuously over a period of time is consistent, the output will be deduplicated.

## Installation

```shell
# pnpm
pnpm add -g git-work-record
# npm
npm install -g git-work-record
```

## Use

### Use from the command line（recommend）

```shell
git-wr #Abbreviated commands, recommended
git-work-record #Or through the project name
```

### Programming mode use

```js
import GitWrokRecord from "git-work-record";
const main = async () => {
	const logs = await GitWrokRecord({
		// Here are the parameters, as detailed below
	});
	// What is returned is the submission record, which can be reprocessed according to your own needs.
};
main();
```

If you encounter a similar error of `Cannot find package 'git-work-record'` in programming, you can install `git-work-record` in the programming directory or check the Node environment variable.

## Parameters

| Parameter name | Description                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| --author       | Git submission author. Default is the author of the configuration in the project.                                                                                                                                                                                                                            |
| --committer    | The actual submitter of Git does not participate in the query by default                                                                                                                                                                                                                                     |
| --search       | Only submission information containing specific characters is required                                                                                                                                                                                                                                       |
| --since        | Alias day, a since parameter similar to git log, is used to query submission records for a specific time range. Specific time value, format:? days,? weeks,? years, 2016-11-25. Passing a number will be regarded as a days, such as-- since=2, and will be used as a 2days to query data for nearly 2 days. |
| --copy         | Automatically copy content to the clipboard,Effective only when exercised by order                                                                                                                                                                                                                           |
| --deep         | Directory recursive level. If you need to query Git projects in multiple subdirectories at the same time, you can pass the level that needs recursive query. The default is 3.                                                                                                                               |
| --reverse      | Whether to query the Git submission record in reverse order. If the submission time is early, or if it is late, it is not enabled by default.                                                                                                                                                                |
| --cwd          | When called programmatically, it must be passed, which is the basic path for querying Git projects.                                                                                                                                                                                                          |

## Reward the author

If you think this project has helped you, you can buy the author a glass of juice to encourage 🍹.

Reward needs Alipay and WeChat Pay. If you don't have these two payment methods, you can give a free Star.

![Reward the author](https://test-1309419893.cos.ap-shanghai.myqcloud.com/%E6%89%93%E8%B5%8F.png?f=github)
