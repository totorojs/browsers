# browsers

A simple browser manager.

---

## 0. Features

- Detect available browsers.
- Start and kill browser.
- Auto restart browser when necessary.

### Supported browsers

Both on mac and windows.

**Be mind that all browsers must be installed in default path.**

- Chrome
- Safari
- Firefox
- Opera
- IE

## 1. Installation

### Install From npm

```
npm install browsers
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
$ browsers --browsers=chrome,firefox
```

## 3. Cli Options

#### -h, --help

Output usage information.

#### -v, --version

Output the version number.

#### --verbose

Show debug log.

#### --capture

Specify URL to visit.

#### --browsers

Specify browsers to open.

Default: all available browsers on OS.

#### --memory

If browser memory(in M) is more than this value, it will restart.

Default: 200M on windows, and 500M on other OS.

#### --restart

Time(hh:mm) or interval(in hour) to restart
