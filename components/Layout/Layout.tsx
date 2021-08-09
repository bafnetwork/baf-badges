import { Footer } from '../Footer/Footer';
import styles from './Layout.module.scss';
import Head from 'next/head';
import { ReactNode } from 'react';

export interface LayoutProps {
	children: ReactNode,
	pageTitle?: string;
}

export function Layout<P>({ children, pageTitle }: LayoutProps) {
	if (!pageTitle) {
		pageTitle = "BAF Badges";
	}

	return (
		<>
			<Head>
				<title>{pageTitle}</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={styles.container}>
				<div className={styles.content}>
					{children}
				</div>
				<Footer/>
			</div>
		</>
	)
}
