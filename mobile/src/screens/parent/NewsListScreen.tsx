import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Image, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { newsService, NewsDetailDto, PageResponse } from '../../services/news.service';
import { API_URL } from '../../config/api';

export default function NewsListScreen() {
  const navigation = useNavigation<any>();
  const [newsList, setNewsList] = useState<NewsDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const loadNews = async (page: number, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data: PageResponse<NewsDetailDto> = await newsService.getPublishedNews(page, PAGE_SIZE);
      setNewsList(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.log('Error loading news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(0);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(0, false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadNews(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      loadNews(currentPage - 1);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const renderItem = ({ item }: { item: NewsDetailDto }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
    >
      <View style={styles.newsImagePlaceholder}>
        {item.imageUrl ? (
          <Image source={{ uri: getImageUrl(item.imageUrl) as string }} style={styles.newsImage} />
        ) : (
          <Ionicons name="newspaper-outline" size={32} color="#94a3b8" />
        )}
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsDate}>
          {new Date(item.publishedDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản tin nhà trường</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <>
          <FlatList
            data={newsList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có bản tin nào.</Text>
            }
          />
          
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]} 
                onPress={handlePrevPage}
                disabled={currentPage === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? "#94a3b8" : "#0f172a"} />
                <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>Trước</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageInfo}>
                Trang {currentPage + 1} / {totalPages}
              </Text>
              
              <TouchableOpacity 
                style={[styles.pageButton, currentPage >= totalPages - 1 && styles.pageButtonDisabled]} 
                onPress={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                <Text style={[styles.pageButtonText, currentPage >= totalPages - 1 && styles.pageButtonTextDisabled]}>Tiếp</Text>
                <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages - 1 ? "#94a3b8" : "#0f172a"} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  listContainer: {
    padding: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newsContent: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontStyle: 'italic',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginHorizontal: 4,
  },
  pageButtonTextDisabled: {
    color: '#94a3b8',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  }
});
