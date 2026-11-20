# OFD 转 PDF 工具

一个绿色免安装的 Windows 桌面小工具：把 OFD 版式文档转换成 PDF。**拖拽文件进窗口或点按钮选文件即可**，支持批量转换，转换结果直接输出在原文件同目录。

不需要安装 Node.js、不需要装任何依赖——下载 exe 双击就能用。

## 下载

直接下载：[OFD-to-PDF-Tool.exe（约 72 MB）](https://github.com/urbain999/ofd-to-pdf-tool/releases/download/v1.0.0/OFD-to-PDF-Tool.exe)

也可到本仓库 [Releases](https://github.com/urbain999/ofd-to-pdf-tool/releases) 页面查看全部版本。下载后直接双击运行即可。

> 该 exe 为 portable 单文件版，运行时自解压到临时目录，不写注册表、不依赖外部文件。拷到 U 盘给别人也能用。

## 使用方法

1. 双击 `OFD转PDF工具.exe` 打开窗口
2. 把 `.ofd` 文件拖进窗口，或点「选择文件」按钮
3. 点「开始转换」，生成的 `.pdf` 会出现在原 OFD 所在目录
4. 支持一次选多个文件批量转换

## 从源码构建

需要 Node.js 18+。

```bash
npm install
npm run build:win
```

产物在 `dist/` 目录。国内网络可设置镜像加速：

```bash
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
```

开发模式运行：

```bash
npm start
```

## 技术栈

- [Electron 33.2.0](https://www.electronjs.org/) — 桌面窗口（MIT）
- [@miconvert/ofd-to-pdf 0.2.3](https://github.com/huuhuybn/miconvert-ofd-to-pdf) — OFD 解析与 PDF 生成内核（Apache-2.0）
- [pdf-lib 1.17.1](https://github.com/Hopding/pdf-lib) — PDF 处理（MIT）

源码 `main.js` 为主进程（IPC、文件对话框、转换调度），`preload.js` 暴露安全 API，`index.html` 为界面。

## 许可证

本项目自身代码采用 [MIT 许可证](LICENSE)。

本项目依赖的第三方组件各有其许可证，详见 [NOTICE](NOTICE)。使用本工具请遵守相应条款。

## 已知说明

- 仅支持 Windows（exe 为 Windows portable 包）
- 转换质量取决于 OFD 文件本身的规范程度与系统字体
