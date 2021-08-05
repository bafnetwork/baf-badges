import 'reflect-metadata';
import { AnyT, jsonObject, jsonMember, TypedJSON, jsonMapMember, jsonArrayMember } from 'typedjson';
import { BadgeDocumentNotFoundError, ContractMethodNotInitializedError, DeserializationError, MalformedResponseError, NFTMediaIntegrityError, NFTReferenceIntegrityError, ReceivedInternalServerError, UnexpectedStatusError } from './errors';
import uuid from 'uuid';
import { sha256 } from './crypto';

const UPLOAD_BADGE_PATH = 'api/uploadDocument';
const BADGE_DOCUMENT_BASE_PATH = 'storageapi.fleek.co/sladuca-team-bucket'

@jsonObject
export class NearNFT {
	@jsonMember
	public token_id!: string;

	@jsonMember
	public owner_id!: string;

	@jsonMember
	public metadata!: NearNFTMetadata;

	@jsonMember(AnyT)
	public approved_account_ids: any;
}

@jsonObject
export class NearNFTMetadata {
	@jsonMember
	public title!: string;

	@jsonMember
	public description!: string;

	@jsonMember
	public media!: string;

	@jsonMember
	public media_hash!: string;

	@jsonMember
	public copies!: number | null;

	@jsonMember
	public issued_at!: string | null;

	@jsonMember
	public expires_at!: string | null;
	
	@jsonMember
	public starts_at!: string | null;

	@jsonMember
	public updated_at!: string | null;

	@jsonMember
	public extra!: string | null;

	@jsonMember
	public reference!: string;

	@jsonMember
	public reference_hash!: string;
}

export type RequirementType = 'SINGLE' | 'ONE_OF' | 'N_OF' | 'ALL_OF';

@jsonObject
export class BafBadgeRequirement {
	// type of the badge requirement. Possible values are 'SINGLE', 'ONE_OF', 'N_OF', and 'ALL_OF'
	@jsonMember
	public _type!: RequirementType;

	@jsonMember
	public text!: string;

	// used for requirement types other than 'SINGLE'. Empty for 'SINGLE'.
	@jsonArrayMember(BafBadgeRequirement)
	public subRequirements!: BafBadgeRequirement[];
}

@jsonObject
export class BafBadgeDocument {
	// ID of the NFT on-chain
	@jsonMember
	public badgeID!: string;

	// accountID of the artist who created the NFT art. null if no art.
	@jsonMember
	public artistID!: string | null;

	// optional. url to the actual thing the badge is for, e.g. a github repo, blog post, live application, problem set, etc
	@jsonMember
	public url!: string | null;

	// requirements for fulfilling the badge. Can be empty in circumstances where it doesn't make sense.
	@jsonArrayMember(BafBadgeRequirement)
	public requirements!: BafBadgeRequirement[];
}

@jsonObject
export class BafBadgeCreateArgs {
	@jsonMember
	public title!: string;

	@jsonMember
	public description!: string;

	@jsonMember
	public offChain!: BafBadgeDocument;
}

export interface BafBadge {
	onChain: NearNFT;
	offChain: BafBadgeDocument;
}

const nftSerializer = new TypedJSON(NearNFT);
const badgeDocumentSerializer = new TypedJSON(BafBadgeDocument);

export async function getBadgeNFT(badgeID: string): Promise<NearNFT> {
	if (!window.contract.nft_token) {
		throw ContractMethodNotInitializedError('nft_token');
	}

	const nftRaw = await window.contract.nft_token({ token_id: badgeID });

	const nft = nftSerializer.parse(nftRaw);
	if (!nft) {
		throw DeserializationError('NearNFT', nftRaw);
	}

	return nft;
}

// return fleek pubic url
export async function uploadBadgeDocument(document: BafBadgeDocument): Promise<string> {
	const request = new Request(UPLOAD_BADGE_PATH, {
		method: 'POST',
		body: badgeDocumentSerializer.stringify(document)
	});

	const response = await window.fetch(request);
	switch (response.status) {
		case 201:
			const body = await response.json();
			if (!body.url) {
				throw MalformedResponseError(UPLOAD_BADGE_PATH, 'response body missing \'url\' property');
			}
			return body.url;
		case 500:
			throw ReceivedInternalServerError(UPLOAD_BADGE_PATH);
		default:
			throw UnexpectedStatusError(UPLOAD_BADGE_PATH, response.status);
	}
}

export async function getBadgeDocument(nft: NearNFT): Promise<BafBadgeDocument> {
	const url = `${BADGE_DOCUMENT_BASE_PATH}/${nft.metadata.reference}`;
	const response = await window.fetch(url);

	switch (response.status) {
		case 200:
			const body = await response.json();
			const document = badgeDocumentSerializer.parse(body);
			if (!document) {
				throw DeserializationError('BafBadgeDocument', body);
			}
			return document;
		case 404: 
			throw BadgeDocumentNotFoundError(nft.token_id, url);
		default:
			throw UnexpectedStatusError(BADGE_DOCUMENT_BASE_PATH, response.status);
	}
}

export async function getBadge(badgeID: string): Promise<BafBadge> {
	const onChain = await getBadgeNFT(badgeID);

	await verifyNFTReferenceIntegrity(onChain);
	await verifyNFTMediaIntegrity(onChain);

	const offChain = await getBadgeDocument(onChain);

	return { onChain, offChain }	
}

export async function mintBadge(recipientAccountID: string, badgeMediaURL: string, args: BafBadgeCreateArgs): Promise<BafBadge> {
	if (!window.contract.mint) {
		throw ContractMethodNotInitializedError('mint');
	}

	const token_id = uuid.v4().toString();

	const documentPublicUrl = await uploadBadgeDocument(args.offChain);

	const token_metadata = {
		title: args.title,
		description: args.description,
		media: badgeMediaURL,
		media_hash: await sha256(badgeMediaURL),
		issued_at: (new Date()).toString(),
		reference: documentPublicUrl,
		reference_hash: await sha256(documentPublicUrl),
	}

	const nftRaw = await window.contract.mint(
		{
			token_id,
			token_owner_id: recipientAccountID,
			token_metadata,
		},
		undefined,
		1
	);

	const nft = nftSerializer.parse(nftRaw);
	if (!nft) {
		throw DeserializationError('NearNFT', nftRaw);
	}

	return {
		onChain: nft,
		offChain: args.offChain
	}
}

export async function verifyNFTReferenceIntegrity(nft: NearNFT): Promise<void> {
	const hash = await sha256(nft.metadata.reference);
	if (hash !== nft.metadata.reference_hash) {
		throw NFTReferenceIntegrityError(nft.token_id);
	}
}

export async function verifyNFTMediaIntegrity(nft: NearNFT): Promise<void> {
	const hash = await sha256(nft.metadata.media);
	if (hash !== nft.metadata.media_hash) {
		throw NFTMediaIntegrityError(nft.token_id);
	}
}
