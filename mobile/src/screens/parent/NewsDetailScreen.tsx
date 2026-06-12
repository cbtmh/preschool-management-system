import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { newsService, NewsDetailDto } from '../../services/news.service';
import { API_URL } from '../../config/api';

export default function NewsDetailScreen() {
  const [news, setNews] = useState<NewsDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { id } = route.params || {};

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadNewsDetail = async () => {
      try {
        const data = await newsService.getNewsById(id);
        setNews(data);
      } catch (error) {
        console.log('Error loading news detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [id]);

  const stripHtmlTags = (html: string) => {
    if (!html) return '';

    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, '');
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bản tin</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={[styles.content, styles.center]}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : !news ? (
        <View style={[styles.content, styles.center]}>
          <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>Không thể tải bản tin này.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {news.imageUrl && !imageError ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: getImageUrl(news.imageUrl) as string }} 
                style={styles.coverImage} 
                onError={() => setImageError(true)}
              />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <View style={[styles.coverImage, styles.imagePlaceholder]}>
                <Ionicons name="newspaper-outline" size={48} color="#94a3b8" />
              </View>
            </View>
          )}

          <View style={styles.textContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category || 'Tin tức'}</Text>
            </View>

            <Text style={styles.title}>{news.title}</Text>
            
            <View style={styles.metaData}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.date}>
                {new Date(news.publishedDate || news.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            {!!news.summary && (
              <Text style={styles.summary}>{news.summary}</Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.bodyText}>
              {stripHtmlTags(news.content)}
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  imageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  coverImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 30,
    marginBottom: 12,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
  }
});
