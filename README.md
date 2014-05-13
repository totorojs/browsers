# browsers

A simple and stable browser driver.

---

## 0. Features

- Detect available browsers.
- Open specified browser to visit specified URL and close it.

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
npm install browsers -g
```

### Install From Github

to get the latest function

```
git clone git@github.com:totorojs/browsers.git
cd browsers
sudo npm install -g
```

## 2. Quick Start

Auto detect available browsers, and visit totorojs.org

```
$ browsers --capture=totorojs.org
```

Open chrome and firefox to visit totorojs.org

```
$ browsers --browsers=chrome,firefox --capture=totorojs.org
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




