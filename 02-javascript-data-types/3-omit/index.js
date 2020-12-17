/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
	const key = 0;
	const value = 1;

	let objNew = {};
	for (let entry of Object.entries(obj)) {
		if (!fields.includes(entry[key])) {
			objNew[entry[key]] = entry[value];
		}
	}
	return objNew;
};
