import Link from 'next/link';
import { ComponentType, forwardRef } from 'react';

export type WithHref<P> = P & { href?: any };

export function withLink<P>(Inner: ComponentType<P>): ComponentType<WithHref<P>> {
	const WithRef = (props: WithHref<P>, ref: any) => (
		<a href={props.href}>
			<Inner {...props} ref={ref}/>
		</a>
	);
	const WithRefForwarded = forwardRef(WithRef);
	const Wrapped = (props: WithHref<P>) => (
		<Link passHref href={props.href}>
			<WithRefForwarded {...props} />
		</Link>
	);
	
	return Wrapped;
}
