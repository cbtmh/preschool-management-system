import React from 'react';
import { Users, BookOpen, SunMedium, HeartHandshake } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pastel-pink/30 rounded-full blur-3xl -z-10"></div>
        {/* Floating Chibi Emojis */}
        <div className="absolute -top-6 left-10 md:left-20 text-4xl animate-bounce opacity-80 cursor-default select-none z-0">🧸</div>
        <div className="absolute top-10 right-10 md:right-32 text-5xl animate-[pulse_4s_ease-in-out_infinite] opacity-80 -rotate-12 cursor-default select-none z-0">🍎</div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 relative z-10">Về BiBi</h1>
        <p className="text-xl text-slate-600 max-w-2xl leading-relaxed text-center relative z-10">
          Chúng tôi không chỉ là một trường mầm non. Chúng tôi là một cộng đồng cống hiến hết mình vì sự phát triển vui tươi của từng đứa trẻ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div className="order-2 md:order-1 space-y-6">
          <h2 className="text-3xl font-bold text-slate-800">Câu Chuyện Của Chúng Tôi</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Được thành lập vào năm 2010, BiBi bắt đầu với một niềm tin đơn giản: trẻ em học tốt nhất khi chúng vui vẻ, an toàn và được tự do khám phá. Từ một lớp học nhỏ, chúng tôi đã vươn mình trở thành một cộng đồng học tập sôi động.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            Trong suốt những năm qua, chúng tôi đã không ngừng tinh chỉnh chương trình học lấy vui chơi làm cốt lõi, kết hợp các phương pháp giáo dục hiện đại mà vẫn giữ trọn vẹn nét hồn nhiên của tuổi thơ.
          </p>
        </div>
        <div className="order-1 md:order-2 bg-pastel-blue rounded-[3rem] p-2 rotate-2 hover:rotate-0 transition-transform">
          <div className="bg-white rounded-[2.5rem] p-8 h-full flex items-center justify-center border-4 border-pastel-blue">
             {/* Placeholder for an about image, could be an SVG illustration */}
             <div className="text-center">
                <SunMedium className="w-24 h-24 text-orange-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Hơn 10 Năm Cống Hiến</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-pastel-yellow p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pastel-yellow rounded-full opacity-50"></div>
        <h2 className="text-3xl font-bold text-slate-800 mb-12 text-center">Giá Trị Cốt Lõi</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
          <div className="flex gap-4">
            <div className="bg-pastel-pink/50 p-3 rounded-2xl h-fit">
              <HeartHandshake className="w-6 h-6 text-pink-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Đồng cảm & Tử tế</h3>
              <p className="text-slate-600">Dạy trẻ biết thấu hiểu và quan tâm đến người khác là nền tảng xây dựng một cộng đồng vững mạnh và gắn kết.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-pastel-green/50 p-3 rounded-2xl h-fit">
              <BookOpen className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Thúc đẩy sự tò mò</h3>
              <p className="text-slate-600">Chúng tôi khuyến khích trẻ đặt câu hỏi, trải nghiệm và tự tay khám phá trong mọi hoạt động.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-pastel-blue/50 p-3 rounded-2xl h-fit">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hòa nhập</h3>
              <p className="text-slate-600">Mỗi em bé đều đặc biệt và quý giá. Chúng tôi trân trọng sự khác biệt và đảm bảo ai cũng thấy mình thuộc về nơi này.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-pastel-yellow/50 p-3 rounded-2xl h-fit">
              <SunMedium className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Học tập vui vẻ</h3>
              <p className="text-slate-600">Việc học phải thật thú vị! Chúng tôi đưa những trò chơi và sự sáng tạo vào từng khoảnh khắc sinh hoạt hằng ngày.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
