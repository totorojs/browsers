# browsers

A simple browser driver.

---

## 0. Features

- Detect available browsers.
- Open specified browsers to visit specified URL.
- Close specified browsers.

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
npm install -g
```

## 2. Quick Start

Detect all available browsers and visit `totorojs.org`.

```
$ browsers --capture=totorojs.org
```

Specifiy chrome and firefox to visit totorojs.org.

```
$ browsers --capture=totorojs.org --browsers=chrome,firefox
```

## 3. Cli Options

#### -c, --capture

Specify URL to visit.

#### -b, --browsers

Specify browsers to open.

Default: all available browsers on OS.

#### -d, --debug

Show debug log.

#### -v, --version

Output version number.

#### -h, --help

Output usage information.




