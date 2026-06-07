import React from 'react';
import { Baby, Palette, Blocks, Music, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const programs = [
  {
    id: 'toddlers',
    name: 'Nhà Trẻ',
    ageGroup: '18 tháng - 3 tuổi',
    description: 'Chương trình Nhà trẻ cung cấp một không gian an toàn, tràn ngập yêu thương cho những khám phá đầu đời. Chúng tôi tập trung vào các kỹ năng vận động cơ bản, phát triển ngôn ngữ và tương tác xã hội thông qua các trò chơi có hướng dẫn.',
    icon: <Baby className="w-10 h-10 text-pink-500" />,
    color: 'bg-pastel-pink',
    borderColor: 'border-pink-200'
  },
  {
    id: 'preschool',
    name: 'Mầm Non',
    ageGroup: '3 - 4 tuổi',
    description: 'Được thiết kế để xây dựng tính tự lập và sự tự tin. Trẻ sẽ tham gia vào các hoạt động thực hành nhằm giới thiệu những khái niệm cơ bản về toán, khoa học và kỹ năng đọc viết sớm.',
    icon: <Blocks className="w-10 h-10 text-blue-500" />,
    color: 'bg-pastel-blue',
    borderColor: 'border-blue-200'
  },
  {
    id: 'pre-k',
    name: 'Mẫu Giáo',
    ageGroup: '4 - 5 tuổi',
    description: 'Chuẩn bị cho bé bước ngoặt lớn! Chương trình này nhấn mạnh vào phát triển nhận thức, kỹ năng giải quyết vấn đề và các hoạt động nhóm có cấu trúc để đảm bảo bé sẵn sàng vào lớp 1.',
    icon: <Palette className="w-10 h-10 text-orange-500" />,
    color: 'bg-pastel-yellow',
    borderColor: 'border-orange-200'
  },
  {
    id: 'after-school',
    name: 'Ngoại Khóa Nghệ Thuật',
    ageGroup: '3 - 6 tuổi',
    description: 'Chương trình bồi dưỡng tùy chọn tập trung vào thể hiện tính sáng tạo. Bao gồm âm nhạc, vận động, hội họa và diễn kịch trong một buổi chiều thư giãn.',
    icon: <Music className="w-10 h-10 text-green-500" />,
    color: 'bg-pastel-green',
    borderColor: 'border-green-200'
  }
];

const Programs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center text-center mb-16 relative">
        {/* Floating Chibi Emojis */}
        <div className="absolute top-0 left-5 md:left-10 text-5xl animate-[bounce_5s_infinite] opacity-80 cursor-default select-none z-0">🖍️</div>
        <div className="absolute top-8 right-5 md:right-10 text-4xl animate-[pulse_3s_ease-in-out_infinite] opacity-80 rotate-12 cursor-default select-none z-0">🪁</div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 relative z-10">Chương Trình Của Chúng Tôi</h1>
        <p className="text-xl text-slate-600 max-w-2xl text-center relative z-10">
          Những trải nghiệm giáo dục được thiết kế riêng biệt, phù hợp với từng giai đoạn phát triển của trẻ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {programs.map((program) => (
          <div 
            key={program.id}
            className={`rounded-[2.5rem] border-4 ${program.borderColor} p-8 md:p-10 relative overflow-hidden group hover:scale-[1.02] transition-transform bg-white shadow-sm`}
          >
            {/* Decorative background blob */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 ${program.color} rounded-full opacity-30 -z-10 group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="flex items-center gap-6 mb-6">
              <div className={`p-4 rounded-2xl ${program.color}/50 shadow-sm`}>
                {program.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{program.name}</h2>
                <p className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm inline-block mt-2">
                  Độ tuổi: {program.ageGroup}
                </p>
              </div>
            </div>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {program.description}
            </p>
            
            <Link to="/contact" className="inline-flex items-center text-slate-800 font-bold hover:text-orange-500 transition-colors">
              Yêu cầu thông tin <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Programs;
