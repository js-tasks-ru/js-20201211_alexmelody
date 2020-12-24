/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
	const keys = path.split('.')[Symbol.iterator](); // iterator for keys in the path
	
	return function getter(obj) {  // function getter checks the keys recursively
        const [property, pathEnd] = Object.values(keys.next());
        return (obj === undefined || pathEnd) ? obj : getter(obj[property]); 
	}
}
