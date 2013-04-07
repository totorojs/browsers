browsers-launcher
=================

一个简单易用的浏览器管理模块


## 安装
```
npm install browsers -g
```

## 主要功能
1. 浏览器启动和关闭
2. 浏览器状态查询
3. 操作系统中的浏览器的探测
4. 通过 web 形式的浏览器管理
5. 提供 http 接口控制 

## 浏览器支持
* Chrome
* ChromeCanary
* Safari
* Firefox
* Opera
* PhantomJS
* IE

## 使用
### 命令行方式
```

browsers run --browsers=IE,Chrome,Firefox
browsers run --browsers=IE,Chrome,Firefox --capture=http://10.**:9000
```
也可以在本地增加配置文件 **browsersConfig.json**

```
{
    "browsers": ["IE", "IE", "Chrome", "Chrome"],
    "capture": "http://10.**:9000"
}
```
```
$ browsers run
```
### API 方式
```
var browsers = require('browsers);
```


## 提供 web 服务
* 浏览器的管理 **http://127.0.0.1:8080**
* 管理页面的聚合 **http://127.0.0.1:8080/manager.html**

## 注意
* 浏览器需要安装在默认路径才能被识别.
