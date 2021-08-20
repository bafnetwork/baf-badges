import { Layout, PageName } from '../components/Layout/Layout';
import { withNearWallet } from '../components/withNearWallet';
import { mintBadge } from '../utils/badge';
import { useForm } from 'react-hook-form';
import { TextArea, TextInput } from '../components/FormWrappers/';
import { vestResolver } from '@hookform/resolvers/vest';
import vest from 'vest';
import { vestUtils } from '../utils/misc';
import { DEFAULT_BADGE_IMAGE_URL } from '../utils/constants';
import { Typography, Form, Button, Spin, Result } from 'antd';
import { useRouter } from 'next/router';
import { LinkButton } from '../components/LinkButton';
import { pollTxStatus, TxStatus } from '../utils/near';
import { useEffect, useState } from 'react';
import { UnexpectedUIStateError } from '../utils/errors';

const { Title } = Typography;

export interface MintBadgesFormData {
	title: string;
	description: string;
	recipient: string;
	artistID?: string;
	url?: string;
}

const validationSuite = vest.create((data: MintBadgesFormData | Record<string, never>) => {
	const { required } = vestUtils(data);

	required('title');
	required('description');
	required('recipient');

	// TODO: validate data.recipient to make sure it's a valid NEAR accountID and the account exists
	// TODO: validate data.artistID to make sure either it's not given or it's a valid NEAR accountID and the account exists
	// TODO: validate data.url to make sure either it's not given or it's a valid url.
	// see https://github.com/bafnetwork/baf-badges/issues/6 
})

function MintBadges() {
	const router = useRouter();
	const [txStatus, setTxStatus] = useState<TxStatus | undefined>(undefined);
	const [currentBadgeId, setCurrentBadgeId] = useState<string | undefined>(undefined);
	const [explorerUrl, setExplorerUrl] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (router.query?.transactionHashes) {
			const txHash = router.query.transactionHashes;
			console.log(txHash);
			const cleanup = pollTxStatus(txHash as string, (statusInfo) => {
				setTxStatus(statusInfo.status);
				setExplorerUrl(statusInfo.explorerUrl);
			});

			return cleanup;
		}
	})

	const { register, handleSubmit, control, formState: { errors } } = useForm({
		resolver: vestResolver(validationSuite)
	});

	const onSubmit = handleSubmit(async (data: MintBadgesFormData) => {
		const { title, description, recipient } = data;

		const badge = await mintBadge(recipient, DEFAULT_BADGE_IMAGE_URL, {
			title,
			description,
			offChain: {
				artistID: null,
				url: null,
				requirements: null
			}
		});
		
	})

	const feedback = () => {
		switch (txStatus) {
			case undefined:
				return <></>
			case TxStatus.FAILED:
				return (
					<Result
						status="error"
						title="Transaction Failure"
						subTitle="Failed to mint new NFT"
						extra={[
							<Button key="dismiss">Dismiss</Button>,
							<LinkButton key="explorer" href={explorerUrl ?? "#"} target="_none" >
								See Explorer
							</LinkButton>	 
						]}
					/>
				);
			case TxStatus.SUCCEEDED:
				return (
					<Result
						status="success"
						title="Transaction Successful"
						subTitle="Successfully minted badge"
						extra={[
							<Button key="dismiss">Dismiss</Button>,
							<LinkButton key="explorer" href={explorerUrl ?? "#"} target="_none">
								See Explorer
							</LinkButton>	 
						]}
					/>
				);
			case TxStatus.PENDING:
			case TxStatus.NOT_STARTED:
				return (
					<div>
						<Spin/>
						<LinkButton href={explorerUrl ?? "#"} target="_none">
							See Explorer
						</LinkButton>	 
					</div>
				);
			default:
				throw UnexpectedUIStateError(`expected undefined or TxStatus, got ${txStatus}`);
		}
	}

	return (
		<>
			<Title>Mint Badge</Title>
			<Form onFinish={onSubmit}>
				<TextInput
					control={control}
					label="Title"
					fieldName="title"
				/>

				<TextArea
					control={control}
					label="Description"
					fieldName="description"
					helpMsg={errors.description}
				/>

				<TextInput
					control={control}
					label="Recipient"
					fieldName="recipient"
				/>
				{/* TODO: add "url" field with a tooltip that says what it's for */}
				{/* see https://github.com/bafnetwork/baf-badges/issues/7 */}
				<Button htmlType="submit">
                	Submit
              	</Button>
			</Form>
			{ feedback() }
		</>
	)
}

const GetLayout = (page: any) => {
	<Layout page={PageName.MINT_BADGES}>
		{ page }
	</Layout>
}

MintBadges.getLayout = GetLayout;

export default withNearWallet(MintBadges)