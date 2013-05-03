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
4. 浏览器状态的管理

## 浏览器支持
* Chrome
* Safari
* Firefox
* Opera
* IE

## 使用
```
browsers --browsers=IE,Chrome,Firefox

browsers --browsers=IE,Chrome,Firefox --capture=http://10.15.52.87:9000

browsers --browsers=IE,Chrome,Firefox --manager
```
也可以在本地增加配置文件 **browsers-config.json**

```
{
    "browsers": ["IE", "Chrome"],
    "capture": "http://10.15.52.87:9000"
}
```


## web 服务
* 默认管理页面
**http://127.0.0.1:8080**

* 管理页面的聚合地址，只有开启管理功能(**--manager**) 才有效 
**http://127.0.0.1:8080/hub/managers**

    > 当服务开启管理功能时，支持其他服务器向此服务器进行信息注册. 然后通过上面这个地址查看错误注册的服务信息.

## totoro 通信
当用户没有指定 **capture** 选项时，browsers 会挂载到默认指定的 totoro 服务上，通过 totoro 发布的信息来确定浏览器的打开，关闭和对应的打开地址.

## 注意
* 浏览器需要安装在默认路径才能被识别.
