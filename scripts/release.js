const { execSync, spawn } = require('child_process')
const packageDefJson = require('../package.json')

const { writeFileSync, renameSync } = require('fs')
const yaml = require('js-yaml')
const fetch = require('node-fetch')
const semver = require('semver')
let packageDef = JSON.parse(JSON.stringify(packageDefJson))

const envMode = process.env.MODE
console.log('current env:', envMode)
const pathName = 'chain-trade-client' + (envMode == 'prod' ? '' : '-' + envMode)
const chinesName =
  envMode === 'dev'
    ? '开发版'
    : envMode === 'staging'
    ? '测试版(预生产)'
    : '测试版'

const config = {
  name: pathName,
  build: {
    ...packageDef.build,
    appId: pathName,
    productName: '链贸通-' + chinesName,
    artifactName: '${productName}_Setup_${version}.${ext}',
    publish: {
      ...packageDef.build.publish,
      path: '/' + pathName,
      channel: 'latest'
    }
  }
}

function getVersion(mode) {
  if (mode === 'dev') {
    // 开发版本的版本号 = 当前年份 - 2023 + . + 当前年份的第几天 +  . +当前时间的秒数
    // 时间使用北京时间

    // 涉及到时间获取，需要设置时区
    process.env.TZ = 'Asia/Shanghai'

    const dayOfYear = date =>
      Math.floor(
        (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
      )

    const secondOfDay = date =>
      Math.floor(
        (date - new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
          1000
      )

    // 获取当前提交的时间戳
    const commitTimeStamp = execSync('git show -s --format=%ct')
      .toString()
      .trim()
    const now = new Date(commitTimeStamp * 1000)
    const year = now.getFullYear() - 2023
    const day = dayOfYear(now)
    const second = secondOfDay(now)
    return `${year}.${day}.${second}`
  }
  return execSync('git tag --points-at HEAD | tail -n1').toString().trim()
}

function isProdVersion(version) {
  return version.startsWith('v') && !version.includes('rc')
}
function isStagingVersion(version) {
  return version.startsWith('v') && version.includes('rc')
}

let version = getVersion(envMode)
console.log('current version:', version)

function build() {
  // console.log('packageDef:', packageDef)
  // console.log('build same:', packageDef === packageDefJson)
  // 开发环境
  if (envMode === 'dev') {
    // 开发版使用不同的图标, 按顺序替换
    renameSync('build/icons', 'build/icons-backup')
    renameSync('build/icons-dev', 'build/icons')
    packageDef = {
      ...packageDef,
      version,
      ...config
    }
  }

  // 每次推送tags时，自动发布新的版本
  // rc版本的不要发布到正式版
  if (isProdVersion(version)) {
    packageDef.version = version.slice(1)
  }
  if (isStagingVersion(version)) {
    // version不能带有rc, 否则无法生成latest.yaml文件
    packageDef = {
      ...packageDef,
      version: version.slice(1),
      ...config
    }
  }

  writeFileSync('package.json', JSON.stringify(packageDef, null, 2))

  // TODO 密码要写在环境变量里进行读取，不应该写在代码里
  spawn('npm', ['run', 'pub-win'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      AWS_ACCESS_KEY_ID: process.env.MINIO_USER,
      AWS_SECRET_ACCESS_KEY: process.env.MINIO_PASS
    }
  })
    .on('exit', code => {
      console.log('exit code:', code)
      // 恢复package.json
      writeFileSync('package.json', JSON.stringify(packageDefJson, null, 2))
      // 恢复图标， 反序恢复
      if (envMode === 'dev') {
        renameSync('build/icons', 'build/icons-dev')
        renameSync('build/icons-backup', 'build/icons')
      }
    })
    .on('error', err => {
      throw err
    })

  console.log('build success!')
}

function init() {
  fetch('https://assets.webterren.com/public/chain-trade-client-dev/latest.yml')
    .then(res => {
      if (res.status !== 200) throw new Error('获取最新版本失败')
      return res.text()
    })
    .then(res => {
      let cfg = yaml.load(res)
      console.log('已发布版本号:', cfg.version)
      console.log('文件名:', cfg.path)
      console.log('发布时间:', new Date(cfg.releaseDate).toLocaleString())

      if (semver.gte(cfg.version, version)) {
        console.log(
          `当前线上版本:${cfg.version}比较新，跳过版本构建: ${version}`
        )
      } else {
        console.log(
          `当前线上版本:${cfg.version} 已过时，开始构建新版本:${version}`
        )
        build(version)
      }
    })
    .catch(err => {
      console.error(err)
      build(version)
    })
}

envMode === 'dev' ? init() : build()
