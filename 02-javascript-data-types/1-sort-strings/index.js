/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  	let arrSorted = arr.slice();

	arrSorted.sort( (a, b) => {
		let objOptions = {};
		objOptions.caseFirst = (param == 'desc') ? 'lower':'upper';
			
		return a.localeCompare(b, ['ru-RU', 'en-US'], objOptions);
	})

	if (param == 'desc') { arrSorted.reverse(); }
	return arrSorted;	
}
