import React from 'react';
import { styles } from '@/app/diary/components/legacy/styles';

const SkeletonCard = ({ children }: { children: React.ReactNode }) => (
  <div style={styles.skeletonCard}>{children}</div>
);

const SkeletonText = ({ width }: { width: string }) => (
  <div style={{ ...styles.skeletonText, width }}></div>
);

const DiarySkeleton = () => (
  <>
    <h3 style={styles.h3}>Past Entries</h3>
    {Array.from({ length: 3 }).map((_, index) => (
      <SkeletonCard key={index}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <SkeletonText width="100px" />
            <SkeletonText width="200px" />
          </div>
          <div style={{ ...styles.skeletonText, width: '30px', height: '30px', borderRadius: '50%' }}></div>
        </div>
        <SkeletonText width="90%" />
        <SkeletonText width="80%" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <SkeletonText width="50px" />
          <SkeletonText width="70px" />
        </div>
      </SkeletonCard>
    ))}
  </>
);

export default DiarySkeleton;
