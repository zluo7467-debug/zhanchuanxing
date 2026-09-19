# 栈川行 · 手机端游客 App

面向长征纪念馆游客的移动 Web App 原型，包含智慧导览、随身讲解、红色影片投影、机器人连接、长征互动游戏和个人足迹。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

开发服务器启动后，浏览器访问命令行显示的本地地址。手机与电脑处于同一网络时，可使用 `npm run dev -- --host`，再从手机访问电脑的局域网地址。

## 生产构建

```bash
npm run build
npm run preview
```

构建文件位于 `dist/`。该目录可部署到 Vercel、Cloudflare Pages、Netlify、GitHub Pages 或任意静态网站服务器。

## 部署到 Vercel

1. 将本目录推送到 GitHub 仓库。
2. 在 Vercel 选择 **Add New Project** 并导入仓库。
3. Framework Preset 选择 **Vite**。
4. Build Command 使用 `npm run build`，Output Directory 使用 `dist`。
5. 点击 Deploy，完成后即可获得 HTTPS 公开网址。

## 部署到 GitHub Pages

项目已包含 `.github/workflows/deploy-pages.yml`。将代码推送到 GitHub 仓库的 `main` 分支后，在仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**；之后每次推送都会自动构建并发布。

默认网址格式为 `https://你的用户名.github.io/仓库名/`。

## 设备接入建议

当前版本用本地状态模拟机器人和投影交互。正式接入时，可将以下动作替换为后端 API 或 WebSocket：

- 扫码绑定机器人与创建游客会话
- 获取机器人位置、电量和工作状态
- 创建导航任务与路线同步
- 影片排队、播放、暂停和结束投影
- 游戏结果与个人精神印记存档

公共场馆版本还需增加内容审核、影片版权、设备抢占权限、隐私政策和紧急停止机制。
