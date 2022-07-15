#!/usr/bin/env node
import 'zx/globals'
import { exit } from 'process'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import Print from 'one-line-print'
import clipboard from 'clipboardy'
import dayjs from 'dayjs'
import updateNotifier from 'update-notifier'

// 指定详细程度，改成false禁用zx自动打印的log
$.verbose = false

// 解析参数
const argv = yargs(hideBin(process.argv))
  .options('author', {
    default: '',
    describe: '查询特定作者的提交记录，默认是所在项目中配置的user.name，如果传了committer则该项默认值为空',
  })
  .options('committer', {
    default: '',
    describe: '查询特定提交者的提交记录，默认为空',
  })
  .options('grep', {
    default: '',
    describe: '提交说明包含字符串，等于git log --grep ',
  })
  .options('since', {
    alias: 'day',
    default: 1,
    // 1days 表示展示1天前的提交历史，具体的时间取值，格式： ?days , ?weeks , ?years, 2016-11-25
    describe: '查询特定时间的提交记录，如果传递是是Number类型，会被当作days，其他的会直接传递给git log',
  })
  .options('style', {
    default: 0,
    describe: '选择输出的显示效果',
  })
  .options('markdown', {
    alias: 'md',
    default: false,
    boolean: true,
    describe: '是否输出markdown格式',
  })
  .options('copy', {
    default: false,
    boolean: true,
    describe: '是否自动拷贝内容到剪贴板',
  })
  .options('deep', {
    default: 3,
    describe: '递归查询的目录层级，越多性能越差，一般默认3即可',
  })
  .options('debug', {
    default: false,
    boolean: true,
    describe: 'debug模式，会在每一步都打印日志',
  }).argv

const grep = argv.grep
const since = isNaN(argv.since * 1) ? argv.since : `${argv.since}days`
const style = argv.style
const markdown = argv.markdown
const copy = argv.copy
const deep = argv.deep
const debug = argv.debug

// debug
const debugLog = (...args) => {
  if (debug) {
    console.log(chalk.blue('INFO:'), ...args)
  }
}

// 检测升级
const pkg = await fs.readJson(path.dirname(argv.$0) + '/../package.json')
updateNotifier({ pkg }).notify({ isGlobal: true })

// 查询提交记录
const projectsLogs = []

// 查询当前目录及其子目录存在 .git 的目录
const GitProjects = await glob(['**/.git/HEAD'], {
  absolute: true,
  markDirectories: true,
  deep,
  // 排除一些不可能的目录，减少查询和不必要的错误
  ignore: ['**/System Volume Information/**', '**/Thumbs.db/**', '**/node_modules/**', '**/dist/**', '**/build/**'],
})

if (!GitProjects.length) {
  console.log(chalk.red('经查询，不存在Git项目'))
  exit()
}

for (let i = 0, len = GitProjects.length; i < len; i++) {
  const p = GitProjects[i]
  // 进入Git项目目录，执行Git命令
  try {
    await within(async () => {
      //  单行打印进度
      !debug && Print.line(`当前进度 ${Math.max((i / len) * 100 - 1, 1).toFixed(2)}%`)

      // 进入目录
      const path = p.replace(/\/.git\/HEAD$/, '')
      cd(path)
      debugLog(`进入目录：${path}`)

      // 默认提交作者
      const author = argv.author || (argv.committer ? '' : await $`git config user.name`).stdout.trim()
      const committer = argv.committer

      debugLog(`使用author：${author}`)
      debugLog(`使用committer：${committer}`)

      // 查询提交记录

      // NOTE:
      // 1. zx执行时如果包含动态参数，会自动添加$'' 符号转义，官方说法是为了安全、转义后在bash 中也是合法的语法，因此不准备去掉这个限制。
      // 2. 因为zx的这个特殊操作，动态变量不需要外层添加引号，而且某些情况下可能影响使用。看社区讨论可以通过 $.quote 暂时去掉限制。
      // 3. 下面的 _'_ 其实就是 " ，为什么不直接写成双引号，因为测试时有问题，暂时写成这种不太可能重复的字符，后面再替换回来，是为了方便的处理成json。

      // https://github.com/google/zx/blob/main/docs/quotes.md
      // https://github.com/google/zx/issues/144#issuecomment-859745076
      // https://github.com/google/zx/blob/18f64bc2a791ddbf3626217ba9412c06efb9279b/index.mjs#L240

      const flags = [`--grep=${grep}`, `--since=${since}`, `--author=${author}`, `--committer=${committer}`, `--pretty=format:"{_'_text_'_:_'_%s_'_,_'_hash_'_:_'_%h_'_,_'_author_'_:_'_%an_'_,_'_timestamp_'_:%ct}"`]

      const q = $.quote
      $.quote = (v) => v
      const pLog = (await $`git log ${flags}`).stdout
      $.quote = q

      debugLog(`pLogShell：git log ${flags.join(' ')}`)
      debugLog(`pLog结果：${pLog}`)

      // 添加到日志
      const project = path.split('/').pop()
      if (pLog) {
        projectsLogs.push(
          pLog
            .replace(/_'_/gm, '"')
            .split('\n')
            .map((line) => {
              return { ...JSON.parse(line), project }
            }),
        )
      }
    })
  } catch (err) {
    console.log(chalk.red('错误：' + err))
  }
}

!debug && Print.line(`当前进度 100%，查询完成`)

// 按项目、按时间进行合并，显示特定格式效果

const logObj = {}
for (const log of projectsLogs) {
  for (const item of log) {
    const project = item.project
    const day = dayjs(item.timestamp * 1000).format('YYYY-MM-DD')
    const k1 = [0, 1].includes(style) ? project : day
    const k2 = [0, 1].includes(style) ? day : project
    if (!logObj[k1]) {
      logObj[k1] = {
        text: k1,
        logs: {},
      }
    }
    if (!logObj[k1]['logs'][k2]) {
      logObj[k1]['logs'][k2] = []
    }
    logObj[k1]['logs'][k2].push(item)
  }
}

let result = ''
const dealMd = (text, s = '#') => {
  return markdown ? s + text : text
}
Object.values(logObj).forEach(({ text, logs }) => {
  result += `${dealMd(text, '#')}\n`
  Object.keys(logs).forEach((key) => {
    if (style === 1 || style === 2) {
      result += `${dealMd(key, '##')}\n`
    }
    let i = 1
    const children = logs[key]
    for (const log of children) {
      if (style === 0) {
        // 日期：描述
        result += `${dayjs(log.timestamp * 1000).format('YYYY-MM-DD')}：${log.text}\n`
      } else if (style === 3) {
        // 时间：项目：描述
        result += `${dayjs(log.timestamp * 1000).format('HH:mm')} (${log.project}) ：${log.text}\n`
      } else {
        result += `${i}. ${log.text}\n`
        i++
      }
    }
  })
  result += '\n'
})

Print.newLine()
if (result) {
  console.log(`\n${result}\n`)
  if (copy) {
    clipboard.writeSync(result)
  }
} else {
  console.log('没有查询到Git提交记录')
}
