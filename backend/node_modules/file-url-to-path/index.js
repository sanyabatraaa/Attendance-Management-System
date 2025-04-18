function fileURLToPath(path) {
	if (typeof path === 'string') {
		path = new URL(path);
	} else if (!isURLInstance(path)) {
		throw new TypeError('param is not URL string');
	}

	if (path.protocol !== 'file:') {
		throw new TypeError('param is not file protocol');
	}

	return isWindows() ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

function isURLInstance(fileURLOrPath) {
	return fileURLOrPath !== null && fileURLOrPath.href && fileURLOrPath.origin;
}

function isWindows() {
	/* eslint no-undef: 0 */
	return (process && process.platform === 'win32') || navigator.platform.toLowerCase() === 'win32';
}

function getPathFromURLWin32(url) {
	const {hostname} = url; // ''
	let {pathname} = url; //   '/C:/Users/...'
	for (let n = 0; n < pathname.length; n++) {
		if (pathname[n] === '%') {
			// EncodeURIComponent('%') %25
			// encodeURIComponent('\\') %5c
			// encodeURIComponent('/') %2f
			const third = pathname.codePointAt(n + 2) | 0x20;
			if (
				(pathname[n + 1] === '2' && third === 102) || // 2f 2F /
				(pathname[n + 1] === '5' && third === 99) // 5c 5C \
			) {
				throw new Error('must not include encoded \\ or / characters');
			}
		}
	}

	pathname = String.prototype.replace.call(pathname, /\//g, '\\');
	pathname = decodeURIComponent(pathname);
	if (hostname !== '') {
		throw new TypeError('Unable to process UNC path on windows');
	}

	// Otherwise, it's a local path that requires a drive letter
	const letter = pathname.codePointAt(1) | 0x20;
	console.log(pathname, pathname.codePointAt(1), {letter});
	const sep = pathname[2];
	if (
		letter < 97 ||
		letter > 122 || // A..z A..Z
		sep !== ':'
	) {
		throw new Error('must be absolute');
	}

	return pathname.slice(1);
}

function getPathFromURLPosix(url) {
	if (url.hostname !== '') {
		throw new TypeError(platform);
	}

	const {pathname} = url;
	for (let n = 0; n < pathname.length; n++) {
		if (pathname[n] === '%') {
			const third = pathname.codePointAt(n + 2) | 0x20;
			if (pathname[n + 1] === '2' && third === 102) {
				throw new TypeError('must not include encoded / characters');
			}
		}
	}

	return decodeURIComponent(pathname);
}

export default fileURLToPath;
