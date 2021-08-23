import { Layout, PageName } from '../components/Layout/Layout';
import { LoadingOutlined } from '@ant-design/icons';
import { Typography, Card } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from '../styles/Index.module.scss'
import { LinkButton } from '../components/LinkButton';

const { Title } = Typography;

interface RightArrowLinkProps {
  href: string,
  key: string
};

const RightArrowLink = ({ href, key }: RightArrowLinkProps) => <div key={key}><LinkButton href={href} icon={<ArrowRightOutlined/>}/></div>

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
            <RightArrowLink key="my-badges" href="/my-badges"/>
          ]}
        >
          View your badges.
        </Card>

        <Card
          title="Badge Graph"
          actions={[
            <RightArrowLink key="badge-graph" href="/graph"/>
          ]}
        >
          Coming Soon!
        </Card>

        <Card
          title="About BAF Badges"
          actions={[
            <RightArrowLink key="about" href="/about"/>
          ]}
        >
          Coming Soon!
        </Card>

      </div>
    </>
  );
}

const GetLayout = (page: any) => (
  <Layout>
    { page }
  </Layout>
);

Home.getLayout = GetLayout

export default Home;
