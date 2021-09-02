import 'reflect-metadata';
import 'antd/dist/antd.css';

import type { AppProps } from 'next/app'

export default function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = (Component as any).getLayout || ((page: any) => page)
  return getLayout(<Component {...pageProps} />)
}
