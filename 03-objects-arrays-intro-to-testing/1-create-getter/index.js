/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
	const keys = path.split('.')[Symbol.iterator](); // iterator for keys in the path
	
	return function getter(obj) {  // function getter checks the keys recursively
        const key = keys.next();
        return (obj === undefined || key.done) ? obj : getter(obj[key.value]); 
	}
}
