import React from 'react';
import { ArrowRight, Sparkles, Star, Heart, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-24 relative">
        {/* Floating Emoji Stickers */}
        <div className="absolute top-10 left-10 text-5xl md:text-6xl animate-bounce opacity-80 hover:opacity-100 transition-opacity cursor-default select-none -z-10" style={{ animationDuration: '3s' }}>🎈</div>
        <div className="absolute top-20 right-10 text-5xl md:text-6xl animate-[pulse_4s_ease-in-out_infinite] opacity-80 hover:opacity-100 transition-opacity cursor-default select-none -z-10">🚀</div>
        <div className="absolute bottom-10 left-1/4 text-4xl md:text-5xl animate-[bounce_5s_infinite] opacity-80 hover:opacity-100 transition-opacity cursor-default select-none -z-10">🦋</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col gap-6 order-2 md:order-1 relative z-10">
            <div className="absolute -top-10 -left-10 text-pastel-yellow/60 -z-10 animate-[spin_10s_linear_infinite]">
              <Star className="w-16 h-16 fill-current" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-950 leading-tight">
              Nơi Trí Tuệ <br/>
              <span className="text-orange-500 relative inline-block">
                Tỏa Sáng
                <Sparkles className="absolute -top-6 -right-6 text-pastel-yellow w-8 h-8" />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
              Chúng tôi mang đến một môi trường vui chơi, an toàn và đầy tình yêu thương, nơi trẻ có thể khám phá thế giới, xây dựng tình bạn và nuôi dưỡng niềm đam mê học hỏi suốt đời.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/programs" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-lg">
                Khám Phá Chương Trình <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="px-8 py-4 bg-pastel-pink text-pink-900 font-bold rounded-full hover:bg-pink-300 transition-all hover:scale-105 shadow-sm flex items-center justify-center text-lg">
                Đặt Lịch Tham Quan
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Image */}
          <div className="relative order-1 md:order-2">
            {/* Decorative background shape */}
            <div className="absolute inset-0 bg-pastel-yellow rounded-[3rem] rotate-3 scale-105 -z-10 transition-transform hover:rotate-6"></div>
            <div className="absolute inset-0 bg-pastel-blue rounded-[3rem] -rotate-3 scale-105 -z-20 transition-transform hover:-rotate-6"></div>
            
            {/* Image */}
            <img 
              src="/hero-image.png" 
              alt="Trẻ em đang vui chơi và học tập" 
              className="w-full h-auto object-cover rounded-[2.5rem] shadow-xl border-4 border-white relative z-10"
            />
            
            {/* Floating badges */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-pastel-green z-20 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="bg-pastel-green p-2 rounded-full">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Được yêu thích bởi</p>
                <p className="text-xs text-slate-500">500+ Phụ huynh</p>
              </div>
            </div>
            
            {/* Peeking Animal */}
            <div className="absolute -top-8 -right-4 text-5xl md:text-6xl animate-pulse z-20 cursor-default select-none">🐱</div>
          </div>
          
        </div>
      </section>

      {/* Features Section (Brief overview) */}
      <section className="w-full bg-white py-20 border-t border-pastel-yellow/30 relative">
        <div className="absolute top-0 right-1/4 -translate-y-1/2">
           <Flower2 className="w-12 h-12 text-pastel-pink rotate-45" />
        </div>
        <div className="absolute top-10 left-10 text-4xl opacity-50 rotate-12 select-none">🧸</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-50 -rotate-12 select-none">🎨</div>
        
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-16">Vì sao chọn BiBi?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-pastel-blue/20 border border-pastel-blue/50 hover:-translate-y-2 transition-transform relative group">
              <div className="absolute -top-4 -right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🌈</div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 text-blue-500">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Chương trình sáng tạo</h3>
              <p className="text-slate-600 leading-relaxed">Phương pháp học tập thông qua vui chơi của chúng tôi khuyến khích trẻ tự do khám phá và phát triển kỹ năng giải quyết vấn đề.</p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-pastel-green/20 border border-pastel-green/50 hover:-translate-y-2 transition-transform relative group">
              <div className="absolute -top-4 -right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🌻</div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 text-green-600">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Giáo viên tận tâm</h3>
              <p className="text-slate-600 leading-relaxed">Đội ngũ giáo viên giàu kinh nghiệm luôn quan tâm và đồng hành, giúp mỗi em bé đều cảm thấy được yêu thương và trân trọng.</p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-pastel-yellow/20 border border-pastel-yellow/50 hover:-translate-y-2 transition-transform relative group">
              <div className="absolute -top-4 -right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🐞</div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 text-orange-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Môi trường an toàn</h3>
              <p className="text-slate-600 leading-relaxed">Chúng tôi duy trì tiêu chuẩn an toàn cao nhất với cơ sở vật chất hiện đại và quy trình chăm sóc sức khỏe toàn diện.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
