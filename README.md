browsers-launcher
=================

一个纯粹的浏览器管理模块

## 主要功能
1. 浏览器启动和关闭
2. 浏览器状态查询
3. 浏览器定时重启
4. 打开指定页
5. 通信接口

## 浏览器支持
* Chrome
* ChromeCanary
* Safari
* Firefox
* Opera
* PhantomJS
* IE

## 提供 web 服务
* 查看当前浏览器服务状态 **http://%HOST%:8080/browsers**
* 添加浏览器 **http://%HOST%:8080/browsers/Firefox**
* 重启浏览器 **http://%HOST%:8080/restart**

## 安装和使用
### 命令行方式
```
npm install browsers -g
browsers run --browsers=IE,Chrome,Firefox
browsers run --browsers=IE,Chrome,Firefox --capture=http://10.**:9000
```
### API 方式
```
var browsers = require('browsers);
```
## 注意
* 浏览器需要安装在默认路径