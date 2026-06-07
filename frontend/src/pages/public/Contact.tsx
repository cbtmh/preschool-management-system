import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import api from '../../config/axios.instance';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/public/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center text-center mb-16 relative">
        {/* Floating Chibi Emojis */}
        <div className="absolute -top-6 left-5 md:left-24 text-5xl animate-[bounce_4s_infinite] opacity-90 rotate-12 cursor-default select-none z-0">📞</div>
        <div className="absolute top-10 right-5 md:right-24 text-5xl animate-[pulse_3s_ease-in-out_infinite] opacity-80 cursor-default select-none z-0">💌</div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 relative z-10">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-xl text-slate-600 max-w-2xl text-center relative z-10">
          Chúng tôi rất mong nhận được phản hồi từ bạn! Dù bạn muốn đặt lịch tham quan hay chỉ có vài câu hỏi nhỏ, đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Contact Information */}
        <div className="space-y-10 order-2 lg:order-1 text-left">
          <div className="bg-pastel-blue/20 p-8 rounded-[2rem] border border-pastel-blue/50">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Thông Tin Liên Hệ</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Địa Chỉ Của Chúng Tôi</h3>
                  <p className="text-slate-600">xã Thọ Phú<br/>tỉnh Thanh Hóa</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-green-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Số Điện Thoại</h3>
                  <p className="text-slate-600">(84)943350520</p>
                  <p className="text-sm text-slate-500 mt-1">Thứ 2 - Thứ 6: 7:00 Sáng - 6:00 Chiều</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Địa Chỉ Email</h3>
                  <p className="text-slate-600">anhvu2310lva@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="order-1 lg:order-2 text-left">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-yellow/30 rounded-bl-[4rem] -z-10"></div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Gửi Tin Nhắn</h2>
            
            {submitted ? (
              <div className="bg-pastel-green/30 border border-green-200 text-green-800 p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 shadow-sm">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Đã Gửi Tin Nhắn!</h3>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-colors shadow-sm"
                >
                  Gửi Tin Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Tên Phụ Huynh *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pastel-yellow focus:border-orange-300 transition-colors bg-slate-50 focus:bg-white"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Địa Chỉ Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pastel-yellow focus:border-orange-300 transition-colors bg-slate-50 focus:bg-white"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">Số Điện Thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pastel-yellow focus:border-orange-300 transition-colors bg-slate-50 focus:bg-white"
                      placeholder="(0123) 456-789"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Chúng tôi có thể giúp gì cho bạn? *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pastel-yellow focus:border-orange-300 transition-colors bg-slate-50 focus:bg-white resize-none"
                    placeholder="Tôi muốn tìm hiểu thêm về chương trình mẫu giáo..."
                  ></textarea>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang gửi...' : (
                    <>Gửi Tin Nhắn <Send className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Contact;
