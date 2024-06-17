const Minio = require('minio')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

;(async () => {
  var client = new Minio.Client({
    endPoint: 'assets.webterren.com',
    accessKey: 'terren',
    secretKey: 'minio@terren'
  })

  function getRevision() {
    return execSync('git rev-parse --short HEAD').toString().trim()
  }
  // 上传到储存桶
  function uploadFiles(bucket, filePath) {
    const fileStat = fs.statSync(filePath)
    const metaData = {
      'Content-Type': 'application/json',
      'Content-Length': fileStat.size
    }
    let fileDir = filePath
      .toString()
      .split('E:\\Git-project\\ChainTradeClient\\tests\\')[1]
      .replace(/\\/g, '/')
    client.fPutObject(bucket, fileDir, filePath, metaData, (err, objInfo) => {
      if (err) {
        return console.log(err)
      }
      console.log('File uploaded successfully.', objInfo)
    })
  }
  // 递归实现目录的上传
  async function uploadDir(dir, version, bucket) {
    console.log(`update ${dir} to ${version} in ${bucket}`)

    //判断储存桶是否存在
    client.bucketExists(bucket, function (err) {
      if (err) return console.log('bucket err', err)
      // 判断是否是文件
      const isFile = fs.statSync(dir).isFile()
      if (isFile) {
        // 上传文件
        uploadFiles(bucket, dir)
      } else {
        // 进入目录，递归
        fs.readdir(dir, (err, files) => {
          if (err) return console.log('readdir err', err)
          ;(function iterator(i) {
            if (i == files.length) {
              return
            }
            fs.stat(path.join(dir, files[i]), (err, stat) => {
              if (err) return console.log('stat err', err)
              if (stat.isFile()) {
                // 上传文件
                uploadFiles(bucket, path.join(dir, files[i]))
              } else if (stat.isDirectory()) {
                // 进入目录，递归
                uploadDir(path.join(dir, files[i]), version, bucket)
              }
              iterator(i + 1)
            })
          })(0)
        })
      }
    })
  }

  try {
    let version = getRevision()
    let filePath = path.resolve(__dirname, '../tests/coverage')
    await uploadDir(filePath, version, 'test')
    console.log('Upload Success')
  } catch (err) {
    console.error(err)
  }
})()

// 文件浏览：https://assets.webterren.com/ 用上面的账号密码登录
// 参考文档：https://github.com/minio/minio-js/blob/master/README.md
