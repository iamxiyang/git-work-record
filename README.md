# git-work-record

根据 Git 提交记录来写日报、周报、月报。

<div>
  <img src="https://img.shields.io/npm/v/git-work-record?style=for-the-badge" alt="version">
  <img src="https://img.shields.io/github/stars/iamxiyang/git-work-record?style=for-the-badge" alt="stars">
  <img src="https://img.shields.io/github/issues/iamxiyang/git-work-record?style=for-the-badge" alt="issues">
  <img src="https://img.shields.io/npm/l/git-work-record?style=for-the-badge" alt="licence">
</div>

## 升级说明
> 如果你之前使用过v1.x.x的版本，请注意 v2 相比较 v1 有以下变化：

1. 使用 TypeScript 重构，代码结构更清晰。
1. 支持编程方式使用，可以对结果进行个性化处理。
1. 废弃参数 style、markdown，可通过编程方式实现。
1. grep 重命名为 search，改为通过 JS 进行查找。
1. reverse 改为由 JS 对内容进行排序。

## 安装

```shell
# pnpm
pnpm add -g git-work-record
# npm
npm install -g git-work-record
```

## 使用

### 命令行中使用（推荐）

```shell
git-wr #缩写命令，推荐
git-work-record #项目名
```

### 编程方式使用

```js
import GitWrokRecord from "git-work-record";
const logs = await GitWrokRecord({
	// 这里是参数，详见下面
});
// 返回的是提交记录，可以根据自己的需求进行再处理
```

## 参数

| 参数名      | 作用                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| --author    | Git 提交作者，默认是项目中配置的作者                                                                                                                                                                    |
| --committer | Git 的实际提交者，默认不参与查询                                                                                                                                                                        |
| --search    | 只需要包含特定字符的提交信息                                                                                                                                                                            |
| --since     | 别名 day，类似 git log 的 since 参数，用来查询特定时间范围的提交记录。具体的时间取值，格式：?days , ?weeks , ?years, 2016-11-25 , 传递数字会当做 ?days，如 --since=2 ，会当做 2days 查询近 2 天的数据。 |
| --copy      | 自动拷贝内容到剪贴板                                                                                                                                                                                    |
| --deep      | 目录递归层级，如果需要同时查询多个子目录下的 Git 项目，可以传需要递归查询的层级，默认是 3                                                                                                               |
| --reverse   | 是否倒序查询 Git 提交记录，开启提交时间早的在前面、不开启提交时间晚的在前面，默认不开启                                                                                                                 |
| --cwd       | 通过编程方式调用时必传，是查询 Git 项目的基础路径                                                                                                                                                       |


## 打赏作者

如果你觉得这个项目帮助到了你，你可以帮作者买一杯果汁表示鼓励 🍹。

![打赏](https://test-1309419893.cos.ap-shanghai.myqcloud.com/%E6%89%93%E8%B5%8F.jpg)
