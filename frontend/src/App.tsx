import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' } },
          error: { style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' } },
        }}
      />
    </>
  );
}
