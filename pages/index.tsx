import { Layout, PageName } from '../components/Layout/Layout';
import Link from 'next/link';
import { LoadingOutlined } from '@ant-design/icons';
import { Typography, Card } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { withLink } from '../components/withLink';
import styles from '../styles/Index.module.scss'

const { Title } = Typography;

const ArrowRightOutlinedLink = withLink(ArrowRightOutlined);

function Home() {
  return (
    <>
      <Title>
        Welcome to BAF Badges!
      </Title>

      <div className={styles.grid}>
        <Card
          title="My Badges"
          actions={[
            <ArrowRightOutlinedLink key="my-badges" href="/my-badges"/>
          ]}
        >
          View your badges.
        </Card>

        <Card
          title="Badge Graph"
          actions={[
            <ArrowRightOutlinedLink key="badge-graph" href="/graph"/>
          ]}
        >
          Coming Soon!
        </Card>

        <Card
          title="Mint Badges"
          actions={[
            <ArrowRightOutlinedLink key="mint-badges" href="/mint-badges"/>
          ]}
        >
          Coming Soon!
        </Card>

        <Card
          title="About BAF Badges"
          actions={[
            <ArrowRightOutlinedLink key="about" href="/about"/>
          ]}
        >
          Coming Soon!
        </Card>

      </div>
    </>
  );
}

const GetLayout = (page: any) => (
  <Layout page={PageName.HOME}>
    { page }
  </Layout>
);

Home.getLayout = GetLayout;

export default Home;
