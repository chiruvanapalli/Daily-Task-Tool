
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const docRef = doc(db, "workspace", "main_storage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // Initialize default state if document doesn't exist
      const initialState = {
        id: 'main_storage',
        tasks: [],
        teamMembers: ['Akhilesh', 'Pravallika', 'Chandu', 'Sharanya']
      };
      await setDoc(docRef, initialState);
      return NextResponse.json(initialState);
    }
  } catch (error) {
    console.error('Firebase GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Firestore' }, { status: 500 });
  }
}
