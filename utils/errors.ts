function createError(name: string, message: string): Error {
	// possibly do other things here
	return new Error(`${name}: ${message}`);
}

export const ContractMethodNotInitializedError = (method: string) => createError(
	"ContractMethodNotInitializedError",
	`contract method '${method}' is not initialized`
);

export const DeserializationError = (_type: string, raw: any) => createError(
	'DeserializationError',
	`failed to deserialize ${raw} to ${_type}`
);

export const SerializationError = (_type: string, raw: any) => createError(
	'SerializationError',
	`failed to serialize ${raw} to ${_type}`
);

export const MalformedResponseError = (url: string, reason: string) => createError(
	'MalformedResponseError',
	`malformed response from request to ${url}: ${reason}`
);

export const ReceivedInternalServerError = (url: string) => createError(
	'ReceivedInternalServerError',
	`received internal server error from request to ${url}`
);

export const UnexpectedStatusError = (url: string, status: number) => createError(
	'UnexpectedStatusError',
	`received unexpected status code ${status} from request to ${url}`
);

export const UnexpectedTxOutcomeError = (txHash: string, statusGot: any) => createError(
	'UnexpectedTxOutcomeError',
	`for txHash ${txHash}, received unexpected FinalExecutionOutcome ${statusGot}`
);

export const UnexpectedUIStateError = (msg: string) => createError(
	'UnexpectedUIStateError',
	msg
);

export const NFTReferenceIntegrityError = (badgeID: string) => createError(
	'NFTReferenceIntegrityError',
	`badge ${badgeID}'s metadata.reference_hash does not match metadata.reference!`
);

export const NFTMediaIntegrityError = (badgeID: string) => createError(
	'NFTMediaIntegrityError',
	`badge ${badgeID}'s metadata.media_hash does not match metadata.media!`
);

export const BadgeDocumentNotFoundError = (badgeID: string, url: string) => createError(
	'BadgeDocumentNotFoundError',
	`metadata for badge ${badgeID} not found at ${url}`
);

export const LessonDocumentNotFoundError = (url: string, lessonID?: string) => createError(
	'LessonDocumentNotFoundError',
	lessonID ? `content for lesson ${lessonID} not found at ${url}` : `lesson content not found at ${url}`
);

export const InvalidPageEnumValue = (val: any) => createError(
	'InvalidPageEnumValue',
	`getPageTitle received invalid page enum value ${val}`
);

export const UnknownPage = (path: string) => createError(
	'UnknownPage',
	`getCurrentPage received unknown path ${path}`
);
