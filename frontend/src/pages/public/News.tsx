import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsService } from '../../services/news.service';
import { News as NewsType } from '../../types/portal';
import { BACKEND_URL } from '../../config/constants';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper function to assign colors based on category string
const getCategoryColor = (category: string) => {
  const lowercaseCat = category?.toLowerCase() || '';
  
  if (lowercaseCat.includes('thông báo')) {
    return { bg: 'bg-pastel-yellow', text: 'text-orange-700' };
  } else if (lowercaseCat.includes('sự kiện') || lowercaseCat.includes('hoạt động')) {
    return { bg: 'bg-pastel-blue', text: 'text-blue-700' };
  } else if (lowercaseCat.includes('quan trọng')) {
    return { bg: 'bg-pastel-pink', text: 'text-pink-700' };
  }
  // Default color
  return { bg: 'bg-pastel-green', text: 'text-green-700' };
};

const News: React.FC = () => {
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await NewsService.getPublishedNews(pageNum, 6); // Fetch 6 items per page
      if (res.data) {
        setNews(res.data.content || []);
        const totalPagesCount = res.data.page?.totalPages ?? res.data.totalPages ?? 0;
        setTotalPages(totalPagesCount);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center text-center mb-16 relative">
        {/* Floating Chibi Emojis */}
        <div className="absolute -top-4 left-5 md:left-24 text-5xl animate-bounce opacity-90 rotate-[-20deg] cursor-default select-none z-0">📢</div>
        <div className="absolute top-10 right-5 md:right-24 text-5xl animate-[pulse_3.5s_ease-in-out_infinite] opacity-80 cursor-default select-none z-0">🎈</div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 relative z-10">Tin tức & Thông báo</h1>
        <p className="text-xl text-slate-600 max-w-2xl text-center relative z-10">
          Cập nhật những sự kiện mới nhất, các ngày quan trọng và những câu chuyện thú vị từ trường của chúng tôi.
        </p>
      </div>

      {news.length === 0 && !loading ? (
        <div className="text-center py-12 text-slate-500">
          Hiện tại chưa có bài viết nào được đăng.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => {
            const colors = getCategoryColor(item.category);
            return (
              <article 
                key={item.id} 
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group overflow-hidden"
              >
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(item.imageUrl) as string} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                      {item.category || 'Tin tức'}
                    </span>
                    <div className="flex items-center text-slate-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed line-clamp-3">
                    {item.summary || item.content}
                  </p>
                  
                  <Link to={`/news/${item.id}`} className="flex items-center text-orange-500 font-bold hover:text-orange-600 transition-colors mt-auto w-max">
                    Xem thêm <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center text-slate-500">
          Đang tải tin tức...
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="mt-16 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors ${
                page === i 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
