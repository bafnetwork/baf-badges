import { Footer } from '../Footer/Footer';
import { AccountIndicator } from '../AccountIndicator'
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode, useState } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { InvalidPageEnumValue } from '../../utils/errors';
import styles from './Layout.module.scss';

const { Content, Sider, Header } = AntLayout;

export enum PageName {
	HOME = 0,
	MY_BADGES = 1,
	MINT_BADGES = 2,
	BADGE_GRAPH = 3
}

const getPageTitle = (page: PageName): string => {
	switch (page) {
		case PageName.HOME:
			return "BAF Badges";
		case PageName.MY_BADGES:
			return "My Badges";
		case PageName.MINT_BADGES:
			return "Mint Badges";
		case PageName.BADGE_GRAPH:
			return "Graph View";
		default:
			throw InvalidPageEnumValue(page);
	}
}


export interface LayoutProps {
	children: ReactNode,
	page: PageName
}

export function Layout({ children, page }: LayoutProps) {
	const [siderCollapsed, setSiderCollapsed] = useState(true);
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{getPageTitle(page)}</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<AntLayout className={styles.mainLayout}>
				<Sider
					breakpoint="lg"
					collapsible
					collapsedWidth={0}
					collapsed={siderCollapsed}
					onCollapse={(collapsed, _reason) => {
						setSiderCollapsed(collapsed)
					}}
				>
					<AccountIndicator/>
					{/* TODO: pick icons for these */}
					{/*  */}
					<Menu theme="dark" defaultSelectedKeys={[page.toString()]}>
						<Menu.Item key={PageName.HOME.toString()} onClick={() => router.push('/')}>
							Home
						</Menu.Item>
						<Menu.Item key={PageName.MY_BADGES.toString()} onClick={() => router.push('/my-badges')}>
							My Badges	
						</Menu.Item>
						<Menu.Item key={PageName.MINT_BADGES.toString()} onClick={() => router.push('/mint-badges')}>
							Mint Badges
						</Menu.Item>
						<Menu.Item key={PageName.BADGE_GRAPH.toString()}>
							Graph View - Coming Soon!
						</Menu.Item>
					</Menu>
				</Sider>
				<AntLayout>
					<Header></Header>
					<Content className={styles.content}>
						{children}
					</Content>
					<Footer/>
				</AntLayout>
			</AntLayout>
		</>
	)
}
