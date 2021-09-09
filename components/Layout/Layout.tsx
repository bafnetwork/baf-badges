import { Footer } from '../Footer/Footer';
import { AccountIndicator } from '../AccountIndicator'
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode, useState, useEffect } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { InvalidPageEnumValue, UnknownPage } from '../../utils/errors';
import styles from './Layout.module.scss';

const { Content, Sider, Header } = AntLayout;

export enum PageName {
	HOME = 0,
	MY_BADGES = 1,
	MINT_BADGES = 2,
	LESSON_GRAPH = 3
}

const getPageTitle = (page: PageName): string => {
	switch (page) {
		case PageName.HOME:
			return "BAF Badges";
		case PageName.MY_BADGES:
			return "My Badges";
		case PageName.MINT_BADGES:
			return "Mint Badges";
		case PageName.LESSON_GRAPH:
			return "Lesson Graph";
		default:
			throw InvalidPageEnumValue(page);
	}
}

export const getCurrentPage = (path: string): PageName => {
	switch (path) {
		case '/':
			return PageName.HOME;
		case '/my-badges':
			return PageName.MY_BADGES;
		case '/mint-badges':
			return PageName.MINT_BADGES;
		case '/graph':
			return PageName.LESSON_GRAPH;
		default:
			throw UnknownPage(path);
	}
}

export interface LayoutProps {
	children: ReactNode
}

export function Layout({ children }: LayoutProps) {
	const router = useRouter();
	const [siderCollapsed, setSiderCollapsed] = useState(true);
	const [page, setPage] = useState(getCurrentPage(router.pathname));

	useEffect(() => {
		setPage(getCurrentPage(router.pathname));
	}, [router.pathname]);

	const onClickMenuLink = (href: string) => () => {
		router.push(href);
	}

	return (
		<>
			<Head>
				<title>{getPageTitle(page)}</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<AntLayout className={styles.mainLayout}>
				<Sider
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
					<Menu theme="dark" selectedKeys={[page.toString()]}>
						<Menu.Item key={PageName.HOME.toString()} onClick={onClickMenuLink('/')}>
							Home
						</Menu.Item>
						<Menu.Item key={PageName.MY_BADGES.toString()} onClick={onClickMenuLink('/my-badges')}>
							My Badges	
						</Menu.Item>
						<Menu.Item key={PageName.LESSON_GRAPH.toString()}>
							Lesson Graph - Coming Soon!
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
