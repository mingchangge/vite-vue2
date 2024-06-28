## ico的生成方式：

from https://github.com/develar/app-builder/issues/38

magick命令行来自imagemagick, macOS上安装 `brew install imagemagick`

```bash
magick convert 512x512.png   -resize 256x256   -define icon:auto-resize="256,128,96,64,48,40,32,24,16" icon.ico
```
