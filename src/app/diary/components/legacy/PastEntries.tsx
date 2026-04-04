import React from 'react';
import EntryCard, { Entry } from './EntryCard';
import { styles } from '@/app/diary/components/legacy/styles';

const entriesData: Entry[] = [
  {
    id: 1,
    date: 'Today, 9:41 AM',
    mood: 4,
    title: 'Noticed myself getting frustrated',
    preview: 'Someone cut me off in traffic and I felt the familiar heat rising. Instead of honoring my reaction...',
    tags: ['anger', 'awareness'],
  },
  {
    id: 2,
    date: 'Yesterday, 7:15 PM',
    mood: 3,
    title: 'A moment of unexpected calm',
    preview: 'My coworker disagreed with me in the meeting. I took a breath. I listened. It felt different...',
    tags: ['progress', 'work'],
  },
  {
    id: 3,
    date: 'Mon, Mar 20',
    mood: 2,
    title: 'Tough morning',
    preview: 'Woke up with a lot of tension. Couldn\'t identify exactly what was bothering me, but I sat with it...',
    tags: ['anxiety', 'reflection'],
  },
];

const PastEntries = () => (
  <div>
    <h3 style={styles.h3}>Past Entries</h3>
    {entriesData.map((entry) => (
      <EntryCard key={entry.id} entry={entry} />
    ))}
  </div>
);

export default PastEntries;
