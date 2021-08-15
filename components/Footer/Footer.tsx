import Image from 'next/image';
import styles from './Footer.module.scss';
import { Layout } from 'antd';

const AntFooter = Layout.Footer;


export function Footer() {
	return (
      <AntFooter className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          A Project by{' '}
          <span className={styles.logo}>
            {/* TODO: use BAF logo */}
            {/* see https://github.com/bafnetwork/baf-badges/issues/2 */}
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </AntFooter>
	);
}
