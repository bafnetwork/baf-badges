import { TypedJSON } from 'typedjson';
import { NearNFT, BafBadgeDocument, BafBadge } from './badgeTypes';
import { BadgeDocumentNotFoundError, ContractMethodNotInitializedError, DeserializationError, MalformedResponseError, NFTMediaIntegrityError, NFTReferenceIntegrityError, ReceivedInternalServerError, SerializationError, UnexpectedStatusError } from './errors';
import { sha256 } from './crypto';
import { UPLOAD_BADGE_PATH } from "./constants";

// fee required for the minter to pay in order to mint an NFT.
// this fee is used by the contract to cover storage costs, as on NEAR
// the contract has to pay "rent" for its storage.
// right now, this is a naively-set "yeah, this should be enough" value
// TODO: (lowest priority) figure out a way to calculate an upper bound on how much it should cost
const MINT_STORAGE_FEE = "20000000000000000000000";
const nftSerializer = new TypedJSON(NearNFT);
const badgeDocumentSerializer = new TypedJSON(BafBadgeDocument);

export async function getBadgeNFT(badgeID: string): Promise<NearNFT> {
	if (!window.nft_contract.nft_token) {
		throw ContractMethodNotInitializedError('nft_token');
	}

	const nftRaw = await window.nft_contract.nft_token({ token_id: badgeID });

	const nft = nftSerializer.parse(nftRaw);
	if (!nft) {
		throw DeserializationError('NearNFT', nftRaw);
	}

	return nft;
}

// return fleek pubic url
export async function uploadBadgeDocument(document: BafBadgeDocument): Promise<string> {
	const url = `${UPLOAD_BADGE_PATH}/${document.badgeID}`;
	const request = new Request(url, {
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
			throw UnexpectedStatusError(url, response.status);
	}
}

export async function getBadgeDocument(nft: NearNFT): Promise<BafBadgeDocument> {
	const url = nft.metadata.reference;
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
			throw UnexpectedStatusError(url, response.status);
	}
}

export async function getBadge(badgeID: string): Promise<BafBadge> {
	const onChain = await getBadgeNFT(badgeID);

	await verifyNFTReferenceIntegrity(onChain);
	await verifyNFTMediaIntegrity(onChain);

	const offChain = await getBadgeDocument(onChain);

	return { onChain, offChain }	
}

export async function getAllNFTsForOwner(ownerAccountID: string): Promise<NearNFT[]> {
	if (!window.nft_contract.nft_tokens_for_owner) {
		throw ContractMethodNotInitializedError('nft_token');
	}

	const nftsRaw = await window.nft_contract.nft_tokens_for_owner({
		account_id: ownerAccountID
	});

	const nfts = nftSerializer.parseAsArray(nftsRaw);
	if (!nfts) {
		throw DeserializationError('NearNFT', nftsRaw);
	}

	return nfts;
}

export async function getAllBadgesForOwner(ownerAccountID: string): Promise<BafBadge[]> {
	const nfts = await getAllNFTsForOwner(ownerAccountID);

	return await Promise.all(
		nfts.map(async nft => {
			await verifyNFTReferenceIntegrity(nft);
			await verifyNFTMediaIntegrity(nft);
			const offChain = await getBadgeDocument(nft);
			return { onChain: nft, offChain }
		})
	)
}


export interface BafBadgeCreateArgs {
	title: string;
	description: string;
	offChain: Omit<BafBadgeDocument, "badgeID">;
}

export async function mintBadge(badgeID: string, recipientAccountID: string, badgeMediaURL: string, args: BafBadgeCreateArgs): Promise<BafBadge> {
	if (!window.minter_contract.nft_mint) {
		throw ContractMethodNotInitializedError('mint');
	}

	const document = badgeDocumentSerializer.parse({
		...args.offChain,
		badgeID
	});
	if (!document) {
		throw SerializationError('BafBadgeDocument', document);
	}

	const documentPublicUrl = await uploadBadgeDocument(document);
	console.log(`uploaded document for badge ${badgeID} to ${documentPublicUrl}`)

	const token_metadata = {
		title: args.title,
		description: args.description,
		media: badgeMediaURL,
		media_hash: await sha256(badgeMediaURL),
		issued_at: (new Date()).toString(),
		reference: documentPublicUrl,
		reference_hash: await sha256(documentPublicUrl),
	}

	const nftRaw = await window.minter_contract.nft_mint({
		args: {
			token_id: badgeID,
			token_owner_id: recipientAccountID,
			token_metadata,
		},
		amount: MINT_STORAGE_FEE
	});

	const nft = nftSerializer.parse(nftRaw);
	if (!nft) {
		throw DeserializationError('NearNFT', nftRaw);
	}

	return {
		onChain: nft,
		offChain: document
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
