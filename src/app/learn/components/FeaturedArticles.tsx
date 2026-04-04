import React from 'react';
import ArticleCard, { Article } from './ArticleCard';
import ArticleSkeleton from './ArticleSkeleton';
import { styles } from '../styles';

interface FeaturedArticlesProps {
  articles: Article[];
  isLoading: boolean;
}

const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({ articles, isLoading }) => (
  <div>
    <h3 style={styles.h3}>Featured Articles</h3>
    {isLoading
      ? Array.from({ length: 3 }).map((_, index) => <ArticleSkeleton key={index} />)
      : articles.map((article) => <ArticleCard key={article.id} article={article} />)}
  </div>
);

export default FeaturedArticles;
