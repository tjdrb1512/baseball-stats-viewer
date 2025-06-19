import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, Plus } from 'lucide-react';

const STORAGE_KEY = "baseball_stats_data";

export default function BaseballStatsViewer() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ name: "", date: "", hits: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) setRecords(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const addRecord = () => {
    if (!newRecord.name || !newRecord.date || !newRecord.hits) return;
    setRecords((prev) => [...prev, newRecord]);
    setNewRecord({ name: "", date: "", hits: "" });
  };

  const deleteRecord = (index) => {
    const updated = [...records];
    updated.splice(index, 1);
    setRecords(updated);
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setNewRecord(records[index]);
  };

  const applyEdit = () => {
    const updated = [...records];
    updated[editIndex] = newRecord;
    setRecords(updated);
    setNewRecord({ name: "", date: "", hits: "" });
    setEditIndex(null);
  };

  const sortedRecords = [...records].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (sortKey === "hits") {
      return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    } else {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">⚾ 박성빈 야구 기록 뷰어</h1>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          name="name"
          placeholder="선수 이름"
          value={newRecord.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="date"
          placeholder="날짜 (YYYY-MM-DD)"
          value={newRecord.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="hits"
          placeholder="안타 수"
          type="number"
          value={newRecord.hits}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {editIndex === null ? (
        <button onClick={addRecord} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={16} /> 추가
        </button>
      ) : (
        <button onClick={applyEdit} className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <Check size={16} /> 수정 완료
        </button>
      )}

      <table className="w-full mt-6 border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 cursor-pointer" onClick={() => toggleSort("name")}>선수 이름</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort("date")}>날짜</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort("hits")}>안타 수</th>
            <th className="p-2">수정/삭제</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{record.name}</td>
              <td className="p-2">{record.date}</td>
              <td className="p-2 text-center">{record.hits}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button onClick={() => startEdit(idx)} className="text-blue-500">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteRecord(idx)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
