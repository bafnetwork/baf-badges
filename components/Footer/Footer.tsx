import Image from 'next/image';
import styles from './Footer.module.scss';


export function Footer() {
	return (
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          A Project by{' '}
          <span className={styles.logo}>
            {/* TODO: use BAF logo */}
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
	);
}
