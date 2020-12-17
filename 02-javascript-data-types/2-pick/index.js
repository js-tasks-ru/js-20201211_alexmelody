/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
	const key = 0;
	const value = 1;

	let objNew = {};
	for (let entry of Object.entries(obj)) {
		if (fields.includes(entry[key])) {
			objNew[entry[key]] = entry[value];
		}
	}
	return objNew;
};
