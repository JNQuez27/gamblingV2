import React from 'react';
import { styles } from '../styles';

const SkeletonCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...styles.skeletonCard, ...style }}>{children}</div>
);

const SkeletonText = ({ width, height = '1em' }: { width: string; height?: string }) => (
  <div style={{ ...styles.skeletonText, width, height, marginBottom: '0.5em' }}></div>
);

const SkeletonCircle = ({ size }: { size: string }) => (
  <div style={{ ...styles.skeletonCircle, width: size, height: size }}></div>
);

const HomeSkeleton = () => (
  <>
    <div style={{ ...styles.header, paddingBottom: '28px' }}>
      <div style={styles.headerContent}>
        <div>
          <SkeletonText width="180px" height="26px" />
          <SkeletonText width="120px" height="14px" />
        </div>
        <div style={styles.headerActions}>
          <SkeletonCircle size="40px" />
          <SkeletonCircle size="40px" />
        </div>
      </div>
      <SkeletonCard style={{ marginTop: '20px', backgroundColor: '#fef3c7' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <SkeletonCircle size="36px" />
          <div style={{ flex: 1 }}>
            <SkeletonText width="100px" height="12px" />
            <SkeletonText width="90%" height="14px" />
            <SkeletonText width="70%" height="14px" />
          </div>
        </div>
      </SkeletonCard>
    </div>
    <div style={styles.pageContent}>
      <SkeletonCard>
        <div style={styles.weeklyStreakHeader}>
          <div>
            <SkeletonText width="120px" height="16px" />
            <SkeletonText width="150px" height="12px" />
          </div>
          <div style={{ ...styles.streakCounter, background: '#f0f0f0' }}>
            <SkeletonText width="50px" height="20px" />
          </div>
        </div>
        <div style={styles.weekDaysContainer}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={styles.dayContainer}>
              <SkeletonCircle size="38px" />
              <SkeletonText width="12px" height="11px" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard style={{ height: '60px', marginBottom: '16px' }}>
        <div />
      </SkeletonCard>
      <SkeletonCard>
        <SkeletonText width="120px" height="12px" />
        <SkeletonText width="80%" height="16px" />
        <SkeletonText width="100px" height="30px" />
      </SkeletonCard>
    </div>
  </>
);

export default HomeSkeleton;
