export const metadata = {
  title: "Admin — Steam Plant Mailer",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-navy-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
