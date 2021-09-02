import { Layout, PageName } from '../components/Layout/Layout';
import { withNearWallet } from '../components/withNearWallet';
import { mintBadge, UPLOAD_MEDIA_PATH } from '../utils/badge';
import { useForm } from 'react-hook-form';
import { TextArea, TextInput } from '../components/FormWrappers/';
import { vestResolver } from '@hookform/resolvers/vest';
import vest from 'vest';
import { vestUtils } from '../utils/misc';
import { DEFAULT_BADGE_IMAGE_URL } from '../utils/constants';
import { Typography, Form, Button, Spin, Result, message, Upload } from 'antd';
import { useRouter } from 'next/router';
import { LinkButton } from '../components/LinkButton';
import { pollTxStatus, TxStatus } from '../utils/near';
import { useEffect, useState } from 'react';
import { InboxOutlined } from '@ant-design/icons'
import { MalformedResponseError, UnexpectedUIStateError } from '../utils/errors';
import { v4 as uuid } from 'uuid';
import { AppContract } from '../utils/init';

const { Title } = Typography;
const { Dragger } = Upload;

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
	const [explorerUrl, setExplorerUrl] = useState<string | undefined>(undefined);
	const [file, setFile] = useState<File | undefined>(undefined);

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

		const badgeID = uuid().toString();

		const badgeMediaUrl = await handleFileUpload(badgeID) ?? DEFAULT_BADGE_IMAGE_URL;
		if (badgeMediaUrl === 'cancel') {
			return;
		}

		const badge = await mintBadge(badgeID, recipient, badgeMediaUrl, {
			title,
			description,
			offChain: {
				artistID: null,
				url: null,
				requirements: null
			}
		});
	})

	const handleFileUpload = async (badgeID: string): Promise<string | null | 'cancel'> => {
		if (!file) {
			return null;
		}

		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${UPLOAD_MEDIA_PATH}/${badgeID}`, {
			method: 'POST',
			body: formData
		});

		const body = await response.json();

		if (response.status !== 201) {
			message.error(`failed to upload badge media: ${body.msg}`);
			return 'cancel';
		}
		
		if (!body.url) {
			throw MalformedResponseError(UPLOAD_MEDIA_PATH, 'response body missing \'url\' property');
		}
		
		return body.url;
	}

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

				<Form.Item
					label="Badge Media"
				>
					<Dragger
						accept=".png,.jpeg,.svg,.gif"
						beforeUpload={(file, _) => {
							setFile(file);
							return false;
						}}
						onRemove={(_) => {
							setFile(undefined);
						}}
					>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">Upload badge media</p>
					</Dragger>
				</Form.Item>
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


const Wrapped = withNearWallet(MintBadges, AppContract.Minter);

const GetLayout = (page: any) => (
	<Layout>
		{ page }
	</Layout>
);

(Wrapped as any).getLayout = GetLayout;

export default Wrapped;