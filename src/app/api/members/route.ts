import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const members = db.prepare('SELECT * FROM members ORDER BY created_at ASC').all();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const { name, color } = await request.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO members (name, color) VALUES (?, ?)').run(name, color || '#3B82F6');
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const db = getDb();
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
