import React from 'react';
import { styles } from '../styles';

const ArticleSkeleton = () => (
  <div style={styles.skeletonCard}>
    <div style={styles.skeletonIcon}></div>
    <div style={styles.skeletonTextContainer}>
      <div style={{ ...styles.skeletonText, width: '30%' }}></div>
      <div style={{ ...styles.skeletonText, width: '80%' }}></div>
      <div style={{ ...styles.skeletonText, width: '60%' }}></div>
    </div>
  </div>
);

export default ArticleSkeleton;
