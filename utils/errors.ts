function createError(name: string, routine: string, message: string, ): Error {
	// possibly do other things here
	return new Error(`${name} in ${routine}: ${message}`);
}

export const ContractMethodNotInitializedError = (method: string, routine: string) => createError(
	"ContractMethodNotInitializedError",
	routine,
	`contract method '${method}' is not initialized`
);

export const DeserializationError = (_type: string, raw: any, routine: string) => creaateError(
	'DeserializationError',
	routine,
	`failed to deserialize ${raw} to ${_type}`
)

