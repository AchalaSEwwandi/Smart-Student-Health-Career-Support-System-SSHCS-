const AdminFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-primary-dark py-5 mt-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-gray-400">
        <p>&copy; 2026 CareMate Admin Panel</p>
        
        <div className="flex items-center gap-4 mt-3 sm:mt-0">
          <span>v1.0.0</span>
          <span className="text-gray-500">|</span>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Help & Support</a>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;