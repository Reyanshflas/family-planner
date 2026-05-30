import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const db = getDb();
  const plans = db.prepare(`
    SELECT p.*, m.name as member_name, m.color as member_color
    FROM plans p
    JOIN members m ON p.member_id = m.id
    WHERE p.date = ?
    ORDER BY m.name ASC
  `).all(date);
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const { member_id, date, content } = await request.json();
  const db = getDb();
  const existing = db.prepare('SELECT id FROM plans WHERE member_id = ? AND date = ?').get(member_id, date) as { id: number } | undefined;

  if (existing) {
    db.prepare('UPDATE plans SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(content, existing.id);
    const plan = db.prepare(`
      SELECT p.*, m.name as member_name, m.color as member_color
      FROM plans p
      JOIN members m ON p.member_id = m.id
      WHERE p.id = ?
    `).get(existing.id);
    return NextResponse.json(plan);
  }

  const result = db.prepare('INSERT INTO plans (member_id, date, content) VALUES (?, ?, ?)').run(member_id, date, content);
  const plan = db.prepare(`
    SELECT p.*, m.name as member_name, m.color as member_color
    FROM plans p
    JOIN members m ON p.member_id = m.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);
  return NextResponse.json(plan, { status: 201 });
}
