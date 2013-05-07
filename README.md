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
**http://127.0.0.1:9997**

* 管理页面的聚合地址 
**http://127.0.0.1:9997/hub/console**  (只有开启管理功能 **--manager**  才有效)

    > 当服务开启管理功能时，支持其他服务器向此服务器进行信息注册. 然后通过上面这个地址查看错误注册的服务信息.

## 测试服务器的通信
目前浏览器打开是基于 **capture** 的服务是否有效，也就是说 browsers 会检查 capture 的服务是否可访问，只有可访问的情况下才会打开指定的浏览器。
而且会周期性的检查，如果 **capture** 的服务无效，那么会自动关闭相应的浏览器。

## 注意
* 浏览器需要安装在默认路径才能被识别.
