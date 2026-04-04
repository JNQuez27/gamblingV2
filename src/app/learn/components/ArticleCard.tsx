import React from 'react';
import { styles } from '../styles';

export interface Article {
  id: number;
  category: string;
  title: string;
  desc: string;
  readTime: string;
  icon: string;
  color: string;
  border: string;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => (
  <div
    style={{
      ...styles.articleCard,
      background: article.color,
      border: `1px solid ${article.border}`,
    }}
  >
    <div style={styles.articleIconContainer}>
      {article.icon}
    </div>
    <div style={styles.articleContent}>
      <div style={styles.articleMeta}>
        <span style={styles.articleCategory}>{article.category}</span>
        <span style={styles.articleReadTime}>{article.readTime}</span>
      </div>
      <p style={styles.articleTitle}>{article.title}</p>
      <p style={styles.articleDesc}>{article.desc}</p>
    </div>
  </div>
);

export default ArticleCard;
