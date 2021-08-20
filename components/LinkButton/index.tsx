import Link from 'next/link';
import { Button, ButtonProps } from 'antd';

export interface LinkButtonProps extends ButtonProps {
	href: string;
}

export const LinkButton = (props: LinkButtonProps) => (
	<Link href={props.href} passHref>
		<Button {...props} type="link" href="link">
			{ props.children }
		</Button>
	</Link>
);
