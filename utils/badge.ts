import 'reflect-metadata';
import { AnyT, jsonObject, jsonMember, TypedJSON, jsonMapMember, jsonArrayMember } from 'typedjson';
import { ContractMethodNotInitializedError, DeserializationError } from './errors';
import uuid from 'uuid';
import { sha256 } from './crypto';

@jsonObject
export class NearNFT {
	@jsonMember
	public token_id!: string;

	@jsonMember
	public owner_id!: string;

	@jsonMember
	public metadata!: null | NearNFTMetadata;

	@jsonMember(AnyT)
	public approved_account_ids: any;
}

@jsonObject
export class NearNFTMetadata {
	@jsonMember
	public title!: string | null;

	@jsonMember
	public description!: string | null;

	@jsonMember
	public media!: string | null;

	@jsonMember
	public media_hash!: string | null;

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
	public reference!: string | null;

	@jsonMember
	public referenceHash!: string | null;
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
		throw ContractMethodNotInitializedError('nft_token', 'getBadge');
	}

	const nftRaw = await window.contract.nft_token({ token_id: badgeID });

	const nft = nftSerializer.parse(nftRaw);
	if (!nft) {
		throw DeserializationError('NearNFT', nftRaw, 'getBadge');
	}

	return nft;
}

export async function getBadgeDocument(badgeID: string): Promise<BadgeDocument> {
	throw 'unimplemented'
}

export async function getBadge(badgeID: string): Promise<BafBadge> {
	const [onChain, offChain] = await Promise.all([
		getBadgeNFT(badgeID),
		getBadgeDocument(badgeID)
	]);

	return { onChain, offChain }	
}

export async function mintBadge(recipientAccountID: string, badgeMediaURL: string, args: BafBadgeCreateArgs): Promise<BafBadge> {
	if (!window.contract.mint) {
		throw ContractMethodNotInitializedError('mint', 'mintBadge');
	}

	const token_id = uuid.v4().toString();

	const ceramicStreamID = await uploadBadgeDocument(args.offChain);

	const token_metadata = {
		title: args.title,
		description: args.description,
		media: badgeMediaURL,
		media_hash: await sha256(badgeMediaURL),
		issued_at: (new Date()).toString(),
		reference: ceramicStreamID,
		referenceHash: await sha256(ceramicStreamID),
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
		throw DeserializationError('NearNFT', nftRaw, 'mintBadge');
	}

	return {
		onChain: nft,
		offChain: args.offChain
	}
}

// return ceramic streamID
export async function uploadBadgeDocument(document: BafBadgeDocument): Promise<string> {
	throw 'unimplemented'
}

