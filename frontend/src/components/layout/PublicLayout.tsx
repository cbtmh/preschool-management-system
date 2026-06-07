import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Cloud, Bird, Menu, X, Star } from 'lucide-react';

const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Giới thiệu', path: '/about' },
    { name: 'Chương trình', path: '/programs' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-pastel-pink/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pastel-blue/30 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <img src="/logo.jpg" alt="Logo BiBi" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform shadow-sm rounded-xl" />
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              Mầm Non <span className="text-orange-500">BiBi</span>
            </span>
            <span className="absolute -top-3 -right-6 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all">✨</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-lg font-medium transition-colors hover:text-orange-500 relative py-2 ${
                  isActive(link.path) ? 'text-orange-500' : 'text-slate-600'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-pastel-yellow rounded-t-lg -z-10" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-pastel-yellow rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-pastel-blue/30 p-4 shadow-lg absolute w-full">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-medium p-3 rounded-xl transition-colors ${
                    isActive(link.path)
                      ? 'bg-pastel-yellow text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Decorative background elements that persist across pages */}
        <Cloud className="absolute top-20 right-10 w-24 h-24 text-pastel-blue/30 -z-10 animate-pulse" />
        <Cloud className="absolute top-40 left-10 w-16 h-16 text-pastel-blue/30 -z-10 animate-pulse delay-700" />
        <div className="absolute top-1/3 right-[5%] text-4xl text-pastel-yellow/30 -z-10 animate-[spin_10s_linear_infinite] select-none">☀️</div>
        <div className="absolute top-1/2 left-[5%] text-4xl opacity-40 -z-10 animate-bounce select-none" style={{animationDuration: '6s'}}>🌱</div>
        <div className="absolute bottom-20 right-20 text-3xl opacity-40 -z-10 select-none">🍄</div>
        
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pastel-green/40 pt-16 pb-8 relative overflow-hidden mt-auto">
        {/* Footer decorations */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBRMTAgMCAyMCAxMFQ0MCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzhlNmM5IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] bg-repeat-x opacity-50"></div>
        <div className="absolute -top-2 right-10 text-4xl animate-bounce select-none">🐸</div>
        <div className="absolute top-10 left-10 text-4xl animate-[pulse_4s_ease-in-out_infinite] select-none opacity-50">🌻</div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2 text-left">
              <Link to="/" className="flex items-center gap-2 mb-4 group relative w-fit">
                <img src="/logo.jpg" alt="Logo BiBi" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500 rounded-md bg-white p-1" />
                <span className="text-xl font-bold text-slate-800">
                  Mầm Non <span className="text-orange-500">BiBi</span>
                </span>
                <span className="absolute -top-2 -right-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">🐝</span>
              </Link>
              <p className="text-slate-600 max-w-sm mb-6 text-lg leading-relaxed">
                Nuôi dưỡng sự tò mò, sáng tạo và tình yêu học tập suốt đời trong một môi trường an toàn, vui tươi. 🐣
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <div className="w-10 h-10 rounded-full bg-pastel-pink flex items-center justify-center text-pink-700 hover:bg-pink-300 transition-colors cursor-pointer shadow-sm"><Bird className="w-5 h-5"/></div>
              </div>
            </div>
            
            <div className="text-left">
              <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pastel-yellow shrink-0"></span> Liên kết nhanh
              </h4>
              <ul className="space-y-3 pl-4">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                      {link.name} <Star className="w-3 h-3 text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-left">
              <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pastel-green shrink-0"></span> Liên hệ
              </h4>
              <ul className="space-y-3 text-slate-600 pl-4">
                <li>xã Thọ Phú, tỉnh Thanh Hóa</li>
                <li>anhvu2310lva@gmail.com</li>
                <li>(84)943350520</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Mầm Non BiBi. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-800 transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-slate-800 transition-colors">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
