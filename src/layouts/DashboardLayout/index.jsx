import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => (
  <div className="bg-zinc-950 text-neutral-50 flex h-screen w-full overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full">
      <Topbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
