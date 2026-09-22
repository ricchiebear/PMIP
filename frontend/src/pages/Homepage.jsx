import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';

function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        title="PMIP Dashboard"
        description="Explore artists, tracks, releases, countries and music intelligence."
      />
    </PageContainer>
  );
}

export default HomePage;