import { AnyT, jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

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

export type RequirementType = 'SINGLE' | 'ONE_OF' | 'N_OF' | 'ALL_OF';

@jsonObject
export class BafBadgeRequirement {
	// type of the badge requirement. Possible values are 'SINGLE', 'ONE_OF', 'N_OF', and 'ALL_OF'
	@jsonMember
	public _type!: RequirementType;

	@jsonMember
	public text!: string;

	// used for requirement types other than 'SINGLE'. Empty for 'SINGLE'.
	@jsonArrayMember(() => BafBadgeRequirement)
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


export interface BafBadge {
	onChain: NearNFT;
	offChain: BafBadgeDocument;
}