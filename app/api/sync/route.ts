
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { tasks, teamMembers, passcode } = await req.json();

    // Security check remains the same
    if (passcode !== 'admin123' && passcode !== 'team2024') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 });
    }

    const docRef = doc(db, "workspace", "main_storage");
    await updateDoc(docRef, {
      tasks,
      teamMembers,
      lastUpdated: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync with Firestore' }, { status: 500 });
  }
}
