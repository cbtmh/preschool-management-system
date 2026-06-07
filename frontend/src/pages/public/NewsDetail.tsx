import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { NewsService } from '../../services/news.service';
import { News as NewsType } from '../../types/portal';
import { BACKEND_URL } from '../../config/constants';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Reuse helper function from News.tsx
const getCategoryColor = (category: string) => {
  const lowercaseCat = category?.toLowerCase() || '';
  
  if (lowercaseCat.includes('thông báo')) {
    return { bg: 'bg-pastel-yellow', text: 'text-orange-700' };
  } else if (lowercaseCat.includes('sự kiện') || lowercaseCat.includes('hoạt động')) {
    return { bg: 'bg-pastel-blue', text: 'text-blue-700' };
  } else if (lowercaseCat.includes('quan trọng')) {
    return { bg: 'bg-pastel-pink', text: 'text-pink-700' };
  }
  return { bg: 'bg-pastel-green', text: 'text-green-700' };
};

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await NewsService.getPublicNewsById(Number(id));
        if (res.data) {
          setArticle(res.data);
        } else {
          // Navigate back if not found
          navigate('/news');
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-24 min-h-[60vh] flex justify-center items-center">
        <div className="text-xl text-slate-500 animate-pulse font-semibold">Đang tải bài viết...</div>
      </div>
    );
  }

  if (!article) return null;

  const colors = getCategoryColor(article.category);
  const imageUrl = getImageUrl(article.imageUrl);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 relative">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 -left-10 text-4xl animate-bounce opacity-50 rotate-[-15deg] hidden md:block select-none pointer-events-none">✨</div>
      <div className="absolute top-40 -right-10 text-4xl animate-[pulse_4s_ease-in-out_infinite] opacity-50 hidden md:block select-none pointer-events-none">🌟</div>

      <div className="mb-8 max-w-4xl mx-auto">
        <Link 
          to="/news" 
          className="inline-flex items-center text-slate-500 hover:text-orange-500 font-medium transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang Tin tức
        </Link>

        <div className="flex items-center space-x-4 mb-6">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${colors.bg} ${colors.text}`}>
            {article.category || 'Tin tức'}
          </span>
          <div className="flex items-center text-slate-500 font-medium text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString('vi-VN') : ''}
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-8">
          {article.title}
        </h1>
      </div>

      {imageUrl && (
        <div className="max-w-4xl mx-auto rounded-[2rem] overflow-hidden shadow-lg mb-10 border-4 border-white">
          <img 
            src={imageUrl} 
            alt={article.title} 
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      <article className="bg-white rounded-[2rem] p-6 md:p-8 lg:p-12 shadow-sm border border-slate-100 text-left break-words">
        {article.summary && (
          <div className="text-xl text-slate-600 font-medium mb-8 leading-relaxed italic border-l-4 border-orange-300 pl-4">
            {article.summary}
          </div>
        )}
        
        <div className="prose prose-lg prose-slate max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 leading-loose">
            {article.content}
          </div>
        </div>
      </article>
      
      <div className="mt-12 text-center">
        <Link 
          to="/news" 
          className="inline-block px-8 py-4 bg-orange-100 text-orange-600 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
          Xem Thêm Các Tin Khác
        </Link>
      </div>
    </div>
  );
};

export default NewsDetail;
