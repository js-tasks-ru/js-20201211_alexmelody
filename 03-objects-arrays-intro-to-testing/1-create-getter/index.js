/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
	const keys = path.split('.')[Symbol.iterator](); // iterator for keys in the path

	return function(obj) {
		// function getter checks the keys recursively
		function getter(value) {
        	const key = keys.next();
        	return (value === undefined || key.done) ? value : getter(value[key.value]); 
		}
        return getter(obj);
	}
}
