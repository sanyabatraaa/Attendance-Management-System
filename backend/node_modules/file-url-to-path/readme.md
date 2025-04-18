# file-url-to-path

> Convert a file url to a file path

## Install

```
$ npm install file-url-to-path
```

## Usage

```js
/**
 * This function ensures the correct decodings of percent-encoded characters as
 * well as ensuring a cross-platform valid absolute path string.
**/
import fileURLToPath from 'file-url-to-path';

new URL('file:///C:/path/').pathname;
// Incorrect: /C:/path/
fileURLToPath('file:///C:/path/');
 // Correct:   C:\path\ (Windows)

new URL('file://nas/foo.txt').pathname;
// Incorrect: /foo.txt
fileURLToPath('file://nas/foo.txt');
// throw Error:Unable to process UNC path on windows'(Windows)

new URL('file:///你好.txt').pathname;
 // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
fileURLToPath('file:///你好.txt');
 // Correct:   /你好.txt (POSIX)

new URL('file:///hello world').pathname;
// Incorrect: /hello%20world
fileURLToPath('file:///hello world');
// Correct:   /hello world (POSIX)
```
