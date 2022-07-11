import 'zx/globals'
import { exit } from 'process'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import Print from 'one-line-print'
import clipboard from 'clipboardy'
import pug from 'pug'
import { readFileSync } from 'fs'
import { join } from 'path'

// 禁用zx自动打印的log
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
    // 1days 表示展示1天前的提交历史，具体的时间取值，格式： ?days , ?weeks , ?years, 2016-11-25 ，
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
  }).argv

const grep = argv.grep
const since = isNaN(argv.since * 1) ? argv.since : `${argv.since}days`
const style = argv.style
const markdown = argv.markdown
const copy = argv.copy
const deep = argv.deep

const projectsLog = {
  // 项目名：[ { 时间，hash，提交信息 } ]
}

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

for (let i = 0, len = GitProjects.length; i < len - 1; i++) {
  const p = GitProjects[i]
  // 进入Git项目目录，执行Git命令
  try {
    await within(async () => {
      //  单行打印进度
      Print.line(`当前进度 ${Math.max((i / len) * 100 - 1, 1).toFixed(2)}%`)
      // 进入目录
      const path = p.replace(/\/.git\/HEAD$/, '')
      cd(path)
      // 默认提交作者
      const author = argv.author || (argv.committer ? '' : await $`git config user.name`).stdout.trim()
      const committer = argv.committer
      // 查询提交记录
      // NOTE: _'_ 纯粹是因为我直接写双引号不行，所以写个字符后面再替换，方便解析成json，后面看怎么优化
      const pLog = await $`git log --author="${author}" --committer="${committer}" --grep="${grep}" --since="${since}" --pretty=format:"{_'_text_'_:_'_%s_'_,_'_hash_'_:_'_%h_'_,_'_author_'_:_'_%an_'_,_'_timestamp_'_:%ct}" --date=short --reverse --all `
      // 添加到日志
      if (pLog.stdout) {
        projectsLog[path] = pLog.stdout
          .replace(/_'_/gm, '"')
          .replace(/\$'({.+?})'/gm, '$1')
          .split('\n')
          .map((line) => {
            return { ...JSON.parse(line), project: path }
          })
      }
    })
  } catch (err) {
    console.log(chalk.red('错误：' + err))
  }
}

Print.line(`当前进度 100%，查询完成`)

// 按项目、按时间进行合并，显示特定格式效果

let allData = { ...projectsLog }

if (style === 0 || style === 1) {
  // 项目为主
} else if (style === 2 || style === 3) {
  // 日期为主，默认是项目为主的，因此转换成日期来分组的，交给模板引擎渲染
  const dateLog = {}
  for (const key in projectsLog) {
    const data = projectsLog[key]
    for (const item of data) {
      const date = dayjs(item.timestamp).format('YYYY-MM-DD')
      dateLog[date] = dateLog[date] || []
      dateLog[date].push(item)
    }
  }
  allData = { ...dateLog }
}


const result = pug.renderFile(`./src/templates/_${style}${markdown ? '.md' : ''}.pug`, { allData })

Print.newLine()
console.log(allData)
console.log(result)
if (copy) {
  clipboard.writeSync(result)
}
