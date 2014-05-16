![totoro](https://f.cloud.github.com/assets/340282/891339/657d9018-fa54-11e2-9760-6955388fd8fc.jpg)

# totoro-driver

A simple and stable browser driver.

---

## 0. Features

- Detect available browsers.
- Open specified browsers to visit specified URL.
- Reopen browsers when neccessary.

### Supported browsers

Both on mac and windows.

**Be mind that all browsers must be installed in default path.**

- Chrome
- Safari
- Firefox
- IE

## 1. Installation

### Install From npm

```
npm install totoro-driver -g
```

### Install From Github

to get the latest function

```
git clone git@github.com:totorojs/totoro-driver.git
cd totoro-driver
npm install -g
```

## 2. Quick Start

Open chrome and firefox to visit totorojs.org.

```
$ totoro-driver --capture=totorojs.org --browsers=chrome,firefox
```

Detect all available browsers, link to totoro's test server to be labors.

```
$ totoro-driver --capture=server.totorojs.org:9999 --ping=server.totorojs.org:9999/__driver
```

## 3. Cli Options

#### -c, --capture

Specify URL to visit.

#### -b, --browsers

Specify browsers to open.

Default: all available browsers on OS.

#### -i, --interval

Interval(in hour) to restart.

#### -p, --ping

TOTORO SERVER ONLY!

Link to totoro server socket that monitor the pulse of browsers.

#### -d, --debug

Show debug log.

#### -v, --version

Output version number.

#### -h, --help

Output usage information.




