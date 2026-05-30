import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const db = getDb();
  const items = db.prepare(`
    SELECT b.*, m.name as member_name, m.color as member_color
    FROM board_items b
    JOIN members m ON b.member_id = m.id
    WHERE b.date = ?
    ORDER BY b.created_at ASC
  `).all(date);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { date, content, member_id } = await request.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO board_items (date, content, member_id) VALUES (?, ?, ?)').run(date, content, member_id);
  const item = db.prepare(`
    SELECT b.*, m.name as member_name, m.color as member_color
    FROM board_items b
    JOIN members m ON b.member_id = m.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const db = getDb();
  db.prepare('DELETE FROM board_items WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
