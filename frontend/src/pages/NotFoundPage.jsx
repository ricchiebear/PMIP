import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';

function NotFoundPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Page Not Found"
        description="The page you are looking for does not exist."
      />
    </PageContainer>
  );
}

export default NotFoundPage;