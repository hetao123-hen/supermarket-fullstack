# Rebuild Instructions for Trae (after bug fix)

项目路径：C:\Users\31475\Desktop\now super from github

## Bug 已修复

desktop/src/main/database.js 中，addGood/updateGood/deleteGood 三个函数
之前没有检查 saveAll() 的返回值，导致文件写入失败时也提示"成功"，
但刷新列表时读的还是旧文件。

修复内容：三个函数现在都检查 saveAll() 返回值，写入失败返回错误提示。

## 需要重新构建

### 1. 进入 desktop 目录

cd C:\Users\31475\Desktop\now super from github\desktop

### 2. 构建 React 前端

npx vite build

### 3. 打包成 exe（目录模式）

npx electron-builder --win --dir

如果因为图标报错，改成：
npx electron-builder --win --dir --config.win.icon=null

### 4. 复制 exe 到根目录

复制 desktop\dist-electron\win-unpacked\Supermarket Manager.exe
到 C:\Users\31475\Desktop\now super from github\Supermarket Manager.exe

### 5.（可选）彻底清缓存重来

如果还有问题，删掉之前的数据缓存再试：
rm -r $env:APPDATA\Supermarket Manager\data
