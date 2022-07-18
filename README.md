# git-work-record

根据Git提交记录来写日报、周报、月报。代码很简单，是我用来练习zx的小项目。

## 安装

```shell
# pnpm
pnpm add -g git-work-record
# npm
npm install -g git-work-record
```

## 使用

```shell
git-work-record #默认
git-wr #缩写命令
```

## 参数

|  参数名  |  作用  |
| ------- | ------ |
| --author | Git提交作者，默认是项目中配置的作者 |
| --committer | Git的实际提交者，默认不参与查询 |
| --grep | 类似git log 的grep参数，用来查询包含特定字符的提交信息 |
| --since | 别名day，类似git log 的since参数，用来查询特定时间范围的提交记录。具体的时间取值，格式：?days , ?weeks , ?years, 2016-11-25 , 传递数字会当做 ?days，如 --since=2 ，会当做 2days 查询近2天的数据。 |
| --style | 输出风格，目前有 0、1、2、3 几种 风格可选，具体看后文 |
| --markdown | 别名md，是否输出markdown风格 |
| --copy | 自动拷贝内容到剪贴板，默认是只通过终端打印 |
| --deep | 目录递归层级，如果需要同时查询多个子目录下的Git项目，可以传需要递归查询的层级，默认是3  |
| --reverse | 是否倒序查询Git提交记录，开启提交时间早的在前面、不开启提交时间晚的在前面，默认不开启  |

## 输出风格

```shell
# --style=0
项目名 # 项目名是项目所在目录的文件夹名
日期：描述 # 日期格式是 YYYY-MM-DD
```

```shell
# --style=1
项目名：
  日期
    描述
```

```shell
# --style=2
日期
  项目名
    描述
```

```shell
# --style=3
日期
  时间(项目名)：描述  # 时间格式 HH:mm
```

## 打赏作者

如果你觉得这个项目帮助到了你，你可以帮作者买一杯果汁表示鼓励 🍹。

![打赏](https://test-1309419893.cos.ap-shanghai.myqcloud.com/%E6%89%93%E8%B5%8F.jpg)
