import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';
import { FLEEK_BUCKET_BASE_URL, UPLOAD_LESSON_PATH, GET_ROOT_LESSONS_PATH} from './constants';
import { DeserializationError, LessonDocumentNotFoundError, MalformedResponseError, ReceivedInternalServerError, RootLessonDirectoryError, UnexpectedStatusError } from './errors';

// TODO: put some of this on-chain to verify authorship
@jsonObject
export class LessonDocument {
	@jsonMember
	public lessonID!: string;

	@jsonMember
	public title!: string;

	@jsonMember
	public author!: string;

	@jsonMember
	public content!: string;

	// lessonID of all dependencies or "prereqs" for this lesson
	@jsonArrayMember(String)
	public dependencies!: string[];

	// lessonID of all dependents of this lesson - that is,
	// the lessons that declare this lesson as a prerequisite
	@jsonArrayMember(String)
	public dependents!: string[]
}

const lessonDocumentSerializer = new TypedJSON(LessonDocument);

function lessonDocToNode(doc: LessonDocument): LessonNode {
	return {
		...doc,
		dependencies: doc.dependencies.map(lessonIDToNodeRef),
		dependents: doc.dependents.map(lessonIDToNodeRef)
	}
}

export function nodeToRef(node: LessonNode): NodeRef {
	return {
		ref: node,
		isLessonID() {
			return typeof this.ref === 'string'
		},
		lessonID() {
			if (typeof this.ref === 'string') {
				return this.ref
			}
		
			return this.ref.lessonID;
		},
		async get() {
			if (typeof this.ref === 'string') {
				const doc = await getLessonDocument(this.ref);
				this.ref = lessonDocToNode(doc);
			}
			
			return this.ref;
		},
	}
}

export interface NodeRef {
	ref: string | LessonNode;
	isLessonID: () => boolean;
	lessonID: () => string;
	get: () => Promise<LessonNode>;
}

const lessonIDToNodeRef = (lessonID: string): NodeRef => ({
	ref: lessonID,
	isLessonID() {
		return typeof this.ref === 'string'
	},
	lessonID() {
		if (typeof this.ref === 'string') {
			return this.ref
		}
	
		return this.ref.lessonID;
	},
	async get() {
		if (typeof this.ref === 'string') {
			const doc = await getLessonDocument(this.ref);
			this.ref = lessonDocToNode(doc);
		}
		
		return this.ref;
	},
});

export interface LessonNode {
	lessonID: string;
	title: string;
	author: string;
	content: string;
	dependencies: NodeRef[];
	dependents: NodeRef[];
}

export type NewLessonNode = Omit<LessonNode, 'lessonID'>;
export type NewLessonDocument = Omit<LessonDocument, 'lessonID'>;

export interface UploadLessonResult {
	url: string;
	lessonID: string;
}

export async function uploadLesson(node: NewLessonNode): Promise<UploadLessonResult> {
	const doc: NewLessonDocument = {
		...node,
		dependencies: node.dependencies.map(dep => dep.lessonID()),
		dependents: node.dependents.map(dep => dep.lessonID()),
	};

	return await uploadLessonDocument(doc);
};

export async function getLesson(lessonID: string): Promise<LessonNode> {
	const doc = await getLessonDocument(lessonID);
	return lessonDocToNode(doc);
}

export async function uploadLessonDocument(doc: NewLessonDocument): Promise<UploadLessonResult> {
	const request = new Request(UPLOAD_LESSON_PATH, {
		method: 'POST',
		body: JSON.stringify(doc)
	});

	const response = await window.fetch(request);
	switch (response.status) {
		case 201:
			const body = await response.json();
			if (!body.url) {
				throw MalformedResponseError(UPLOAD_LESSON_PATH, 'response body missing \'url\' property');
			}
			if (!body.lessonID) {
				throw MalformedResponseError(UPLOAD_LESSON_PATH, 'response body missing \'lessonID\' property');
			}
			return { url: body.url, lessonID: body.lessonID }
		case 500:
			throw ReceivedInternalServerError(UPLOAD_LESSON_PATH);
		default:
			throw UnexpectedStatusError(UPLOAD_LESSON_PATH, response.status);
	}
}

export const getLessonDocumentUrl = (lessonID: string) => `${FLEEK_BUCKET_BASE_URL}/lesson-documents/${lessonID}`;

export async function getLessonDocument(lessonIDOrUrl: string, isUrl = false): Promise<LessonDocument> {
	if (!isUrl) {
		const url = getLessonDocumentUrl(lessonIDOrUrl);
		return await fetchLessonDocument(url, lessonIDOrUrl);
	}
	return await fetchLessonDocument(lessonIDOrUrl);
}

export async function fetchLessonDocument(url: string, lessonID?: string): Promise<LessonDocument> {
	const response = await window.fetch(url);

	switch (response.status) {
		case 201:
			const body = await response.json();
			const document = lessonDocumentSerializer.parse(body);
			if (!document) {
				throw DeserializationError('LessonDocument', body);
			}
			return document;
		case 404:
			if (!lessonID) {
				throw LessonDocumentNotFoundError(url, "omitted");
			}
			throw LessonDocumentNotFoundError(url, lessonID);
		default:
			throw UnexpectedStatusError(url, response.status)
	}
}

export async function getRootLessonUrls(limit?: number): Promise<string[]> {
	limit = limit ?? 0;
	const url = `${GET_ROOT_LESSONS_PATH}/${limit}`;

	const response = await window.fetch(url);

	switch (response.status) {
		case 200:
			const body = await response.json();
			const { nodes } = body;
			return nodes.map((node: { url: string }) => node.url);
		case 404:
			throw RootLessonDirectoryError(url);
		default:
			throw UnexpectedStatusError(url, response.status)
	}
}