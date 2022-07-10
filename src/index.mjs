import 'zx/globals'
import dayjs from 'dayjs'
import { exit } from 'process'

const allLog = {
  // 项目名：[ { 时间，hash，提交信息 } ]
}

// 查询当前目录及其子目录存在 .git 的目录
const GitProjects = await glob(['**/.git/HEAD'], {
  absolute: true,
  markDirectories: true,
})

if (!GitProjects.length) {
  console.log(chalk.red('不存在Git项目'))
  exit
}

// TODO 根据传参决定查询多少天
const now = dayjs()
const endDay = now.format('YYYY-MM-DD')
const startDay = now.subtract(7, 'day').format('YYYY-MM-DD')
// TODO 根据传参决定格式
const format = '%ad : %s'

for (let p of GitProjects) {
  // 进入Git项目目录，执行Git命令
  try {
    within(async () => {
      // 进入目录
      cd(p.replace(/\/.git\/HEAD$/, ''))
      // 默认提交作者，TODO 根据传参指定作者
      const author = await $`git config user.name`
      // 查询提交记录
      const plog = await $`git log --committer="${author}" --after="${startDay}" --before="${endDay}" --pretty=format:"${format}" --date=short --no-merges --reverse`
      // 添加到日志
      allLog[p] = plog.split('\n')
      // .map((line) => {
      //   const [date, hash, message] = line.split(' : ')
      //   return {
      //     date,
      //     hash,
      //     message,
      //   }
      // })
    })
  } catch (err) {
    console.log(chalk.red('错误：' + err))
  }
}
