const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark border-t border-white/10 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-medium">
        <p>© {currentYear} CareMate Admin Portal. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <a href="/admin/dashboard" className="hover:text-accent transition">Dashboard</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-accent transition">Support</a>
          <span>&middot;</span>
          <span className="text-gray-600">v1.2.0</span>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
