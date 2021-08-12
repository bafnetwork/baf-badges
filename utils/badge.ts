import { TypedJSON } from 'typedjson';
import { NearNFT, BafBadgeDocument, BafBadge } from './badgeTypes';
import { BadgeDocumentNotFoundError, ContractMethodNotInitializedError, DeserializationError, MalformedResponseError, NFTMediaIntegrityError, NFTReferenceIntegrityError, ReceivedInternalServerError, SerializationError, UnexpectedStatusError } from './errors';
import { v4 as uuid } from 'uuid';
import { sha256 } from './crypto';

const UPLOAD_BADGE_PATH = 'api/uploadDocument';
const BADGE_DOCUMENT_BASE_PATH = 'storageapi.fleek.co/sladuca-team-bucket'

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

export async function getAllNFTsForOwner(ownerAccountID: string): Promise<NearNFT[]> {
	if (!window.contract.nft_tokens_for_owner) {
		throw ContractMethodNotInitializedError('nft_token');
	}

	const nftsRaw = await window.contract.nft_tokens_for_owner({
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

export async function mintBadge(recipientAccountID: string, badgeMediaURL: string, args: BafBadgeCreateArgs): Promise<BafBadge> {
	if (!window.contract.mint) {
		throw ContractMethodNotInitializedError('mint');
	}

	const badgeID = uuid().toString();

	const document = badgeDocumentSerializer.parse({
		...args.offChain,
		badgeID
	});
	if (!document) {
		throw SerializationError('BafBadgeDocument', document);
	}

	const documentPublicUrl = await uploadBadgeDocument(document);

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
			token_id: badgeID,
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

	// ! FIXME: this is optimistic. In some circumstances, we should maybe 
	// ! fetch the document from fleek using documentPublicURL first
	// TODO: add an "omptimistic flag" to this method so you can choose. Default to true.
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
