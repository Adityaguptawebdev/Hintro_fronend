import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => (
  <div className="bg-zinc-950 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
    <p className="text-8xl font-black text-zinc-800">404</p>
    <h1 className="text-xl font-bold text-neutral-50">Page not found</h1>
    <p className="text-sm text-[#9f9fa9]">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/dashboard">
      <Button className="bg-primary text-orange-50">Back to Dashboard</Button>
    </Link>
  </div>
);

export default NotFoundPage;
