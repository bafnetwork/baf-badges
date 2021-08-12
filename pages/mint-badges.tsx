import { Layout } from '../components/Layout/Layout';
import { withNearWallet } from '../components/withNearWallet';
import { mintBadge } from '../utils/badge';
import { useForm } from 'react-hook-form';
import { TextArea, TextInput } from '../components/FormWrappers/';
import { vestResolver } from '@hookform/resolvers/vest';
import vest from 'vest';
import { vestUtils } from '../utils/misc';
import { DEFAULT_BADGE_IMAGE_URL } from '../utils/constants';
import { Typography, Form, Button } from 'antd';

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
	// TODO: validate data.artistID to make sure it's a valid NEAR accountID and the account exists
	// TODO: validate data.url to make sure it's a valid URL
})

function MintBadges() {
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
				requirements: []
			}
		});
		
		console.log(`successfully minted badge ${badge.onChain.token_id} to address ${recipient}`);

	})

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
				<Button htmlType="submit">
                	Submit
              	</Button>

			</Form>
		</>
	)
}

const GetLayout = (page: any) => {
	<Layout pageTitle="Mint Badge">
		{ page }
	</Layout>
}

MintBadges.getLayout = GetLayout;

export default withNearWallet(MintBadges)