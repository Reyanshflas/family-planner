'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  color: string;
}

interface Plan {
  id: number;
  member_id: number;
  date: string;
  content: string;
  member_name: string;
  member_color: string;
}

interface BoardItem {
  id: number;
  date: string;
  content: string;
  member_id: number;
  member_name: string;
  member_color: string;
  created_at: string;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const today = getTodayString();

  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [planTexts, setPlanTexts] = useState<Record<number, string>>({});
  const [newBoardContent, setNewBoardContent] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('#3B82F6');
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchPlans();
    fetchBoard();
  }, []);

  async function fetchMembers() {
    const res = await fetch('/api/members');
    const data = await res.json();
    setMembers(data);
    if (data.length > 0 && !selectedMember) {
      setSelectedMember(data[0].id);
    }
  }

  async function fetchPlans() {
    const res = await fetch(`/api/plans?date=${today}`);
    const data = await res.json();
    setPlans(data);
    const texts: Record<number, string> = {};
    data.forEach((p: Plan) => { texts[p.member_id] = p.content; });
    setPlanTexts(texts);
  }

  async function fetchBoard() {
    const res = await fetch(`/api/board?date=${today}`);
    const data = await res.json();
    setBoard(data);
  }

  async function savePlan(memberId: number) {
    const content = planTexts[memberId] || '';
    await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId, date: today, content }),
    });
    setEditingPlan(null);
    fetchPlans();
  }

  async function addBoardItem(e: FormEvent) {
    e.preventDefault();
    if (!newBoardContent.trim() || !selectedMember) return;
    await fetch('/api/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, content: newBoardContent, member_id: selectedMember }),
    });
    setNewBoardContent('');
    fetchBoard();
  }

  async function deleteBoardItem(id: number) {
    await fetch('/api/board', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchBoard();
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMemberName, color: newMemberColor }),
    });
    setNewMemberName('');
    setShowAddMember(false);
    fetchMembers();
  }

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <h1 className="text-lg font-bold text-gray-900">Family Planner</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">{formatDate(today)}</span>
            <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-600 transition">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-12">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Daily Plans</h2>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              {showAddMember ? 'Cancel' : '+ Add Member'}
            </button>
          </div>

          {showAddMember && (
            <form onSubmit={addMember} className="flex gap-2 mb-4 p-3 bg-white rounded-xl border border-gray-200">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Name (e.g. Mom, Dad)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="color"
                value={newMemberColor}
                onChange={(e) => setNewMemberColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <button
                type="submit"
                disabled={!newMemberName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Add
              </button>
            </form>
          )}

          {members.length === 0 && !showAddMember && (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">No family members yet.</p>
              <button
                onClick={() => setShowAddMember(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Add your first family member
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `3px solid ${member.color}` }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                  <span className="font-semibold text-gray-800">{member.name}</span>
                  {editingPlan === member.id && (
                    <span className="ml-auto text-xs text-gray-400">Editing...</span>
                  )}
                </div>

                <div className="p-4">
                  {editingPlan === member.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={planTexts[member.id] || ''}
                        onChange={(e) => setPlanTexts({ ...planTexts, [member.id]: e.target.value })}
                        placeholder={`What's ${member.name}'s plan today?`}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePlan(member.id)}
                          className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPlan(null)}
                          className="px-4 py-1.5 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {planTexts[member.id] ? (
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{planTexts[member.id]}</p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No plan yet</p>
                      )}
                      <button
                        onClick={() => setEditingPlan(member.id)}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition"
                      >
                        {planTexts[member.id] ? 'Edit' : 'Add plan'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Family Board</h2>

          <form onSubmit={addBoardItem} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newBoardContent}
              onChange={(e) => setNewBoardContent(e.target.value)}
              placeholder="Add something to the family board..."
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <select
              value={selectedMember || ''}
              onChange={(e) => setSelectedMember(Number(e.target.value))}
              className="px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newBoardContent.trim() || !selectedMember}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Post
            </button>
          </form>

          {board.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-sm">No board posts yet. Write something!</p>
            </div>
          )}

          <div className="space-y-2">
            {board.map((item) => (
              <div key={item.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: item.member_color }}
                >
                  {item.member_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{item.member_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-0.5 whitespace-pre-wrap">{item.content}</p>
                </div>
                <button
                  onClick={() => deleteBoardItem(item.id)}
                  className="text-gray-300 hover:text-red-400 transition flex-shrink-0"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
