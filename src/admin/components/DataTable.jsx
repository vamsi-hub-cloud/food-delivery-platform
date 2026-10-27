import { useMemo, useState } from 'react'

export default function DataTable({ columns, rows, pageSize = 8, searchKeys = [], searchPlaceholder = 'Search…', toolbar, onRowClick, empty = 'No records found', initialSearch = '', rowKey = 'id' }) {
  const [q, setQ] = useState(initialSearch)
  const [sort, setSort] = useState(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    let r = rows
    if (s && searchKeys.length) r = r.filter((row) => searchKeys.some((k) => String(typeof k === 'function' ? k(row) : row[k] ?? '').toLowerCase().includes(s)))
    if (sort) {
      const col = columns.find((c) => c.key === sort.key)
      const val = (row) => (col.sortValue ? col.sortValue(row) : row[col.key])
      r = [...r].sort((a, b) => { const x = val(a); const y = val(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? '')); return sort.dir === 'asc' ? c : -c })
    }
    return r
  }, [rows, q, sort, searchKeys, columns])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const cur = Math.min(page, pages)
  const view = filtered.slice((cur - 1) * pageSize, cur * pageSize)

  const toggleSort = (c) => {
    if (c.sortable === false) return
    setSort((s) => (!s || s.key !== c.key ? { key: c.key, dir: 'asc' } : s.dir === 'asc' ? { key: c.key, dir: 'desc' } : null))
  }

  return (
    <div>
      {(searchKeys.length > 0 || toolbar) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {searchKeys.length > 0 && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder={searchPlaceholder} className="input !py-2 pl-9" aria-label="Search table" />
            </div>
          )}
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c)} className={`whitespace-nowrap px-4 py-3 font-semibold ${c.sortable === false ? '' : 'cursor-pointer select-none hover:text-ink'} ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.header}{sort?.key === c.key && <span className="ml-1">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {view.map((row) => (
              <tr key={row[rowKey]} onClick={onRowClick ? () => onRowClick(row) : undefined} className={`bg-white transition hover:bg-orange-50/50 ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.align === 'right' ? 'text-right' : ''} ${c.nowrap === false ? '' : 'whitespace-nowrap'}`}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
            {!view.length && <tr><td colSpan={columns.length} className="py-10 text-center text-gray-400">{empty}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>Showing {filtered.length ? (cur - 1) * pageSize + 1 : 0}–{Math.min(cur * pageSize, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="btn-outline btn-sm">← Prev</button>
          <span className="px-2 font-semibold">{cur} / {pages}</span>
          <button disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="btn-outline btn-sm">Next →</button>
        </div>
      </div>
    </div>
  )
}
