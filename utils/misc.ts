import { test, enforce } from 'vest'

export const vestUtils = <T>(data: T) => ({
	required: (fieldName: string) => {
		test(fieldName, `${fieldName} is required`, () => {
		  enforce((data as any)[fieldName]).isNotEmpty();
		})
	}
})
