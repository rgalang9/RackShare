import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <EmptyState icon="hanger" title="This rack is empty… because it doesn't exist">
      <Link to="/">
        <Button>Back to feed</Button>
      </Link>
    </EmptyState>
  );
}
