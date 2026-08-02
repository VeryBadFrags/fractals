export function mustExist<T>(value: T | null, message: string): T {
	if (value === null) {
		throw new Error(message);
	}
	return value;
}

export function getElementById<T extends HTMLElement>(id: string): T {
	return mustExist(
		document.getElementById(id),
		`Element #${id} not found`,
	) as T;
}
