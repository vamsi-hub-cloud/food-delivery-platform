import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../../context/ToastContext'
import DataTable from '../components/DataTable'
import { Avatar, Badge, Card, Field, Modal, PageHeader, StatusBadge, Tabs } from '../components/ui'
import { fmtDateTime } from '../utils/analytics'
import { MODULES } from '../data/seed'
import { useTab } from './shared'

const ACTIONS = ['view', 'create', 'edit', 'delete']
const emptyPerms = () => Object.fromEntries(MODULES.map((m) => [m, { view: false, create: false, edit: false, delete: false }]))

export default function Roles() {
  const { roles, adminUsers, user, update, can } = useAdmin()
  const toast = useToast()
  const [tab, setTab] = useTab('roles')
  const [sel, setSel] = useState('role2')
  const [roleForm, setRoleForm] = useState(null)
  const [userForm, setUserForm] = useState(null)
  const [er, setEr] = useState({})
  const edit = can('settings', 'edit')
  const role = roles.find((r) => r.id === sel) || roles[0]

  const setPerm = (m, a, v) => {
    if (role.system) return
    update('roles', (l) => l.map((r) => (r.id === role.id ? { ...r, permissions: { ...r.permissions, [m]: { ...r.permissions[m], [a]: v, ...(a === 'view' && !v ? { create: false, edit: false, delete: false } : {}), ...(a !== 'view' && v ? { view: true } : {}) } } } : r)), { action: `Changed ${a} permission on ${m}`, module: 'Settings', target: role.name })
  }
  const saveRole = () => {
    if (roleForm.name.trim().length < 3) return setEr({ name: 'Role name is required' })
    if (roles.some((r) => r.name.toLowerCase() === roleForm.name.trim().toLowerCase())) return setEr({ name: 'Role name already exists' })
    const r = { id: `role${Date.now()}`, name: roleForm.name.trim(), description: roleForm.description.trim() || 'Custom role', permissions: emptyPerms() }
    update('roles', (l) => [...l, r], { action: 'Created role', module: 'Settings', target: r.name }); setSel(r.id); toast('Role created — now set its permissions'); setRoleForm(null); setEr({})
  }
  const saveUser = () => {
    const e = {}
    if (userForm.name.trim().length < 3) e.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(userForm.email.trim())) e.email = 'Enter a valid email'
    else if (adminUsers.some((u) => u.id !== userForm.id && u.email.toLowerCase() === userForm.email.trim().toLowerCase())) e.email = 'Email already in use'
    if (!userForm.id && userForm.password.length < 6) e.password = 'Password must be at least 6 characters'
    setEr(e)
    if (Object.keys(e).length) return
    update('adminUsers', (l) => (userForm.id ? l.map((u) => (u.id === userForm.id ? { ...u, name: userForm.name.trim(), email: userForm.email.trim(), roleId: userForm.roleId, status: userForm.status } : u)) : [...l, { id: `u${Date.now()}`, name: userForm.name.trim(), email: userForm.email.trim(), password: userForm.password, roleId: userForm.roleId, status: 'active', lastLogin: 0 }]), { action: userForm.id ? 'Updated admin user' : 'Added admin user', module: 'Settings', target: userForm.name.trim() })
    toast('Admin user saved'); setUserForm(null)
  }

  const userCols = [
    { key: 'name', header: 'Admin', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} /><div><p className="font-semibold">{u.name} {u.id === user.id && <Badge tone="orange">You</Badge>}</p><p className="text-xs text-gray-500">{u.email}</p></div></div> },
    { key: 'role', header: 'Role', sortValue: (u) => roles.find((r) => r.id === u.roleId)?.name, render: (u) => <Badge tone="violet">{roles.find((r) => r.id === u.roleId)?.name}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastLogin', header: 'Last login', sortValue: (u) => u.lastLogin, render: (u) => (u.lastLogin ? fmtDateTime(u.lastLogin) : 'Never') },
    { key: 'a', header: '', sortable: false, align: 'right', render: (u) => edit && <span className="flex justify-end gap-1.5"><button className="btn-outline btn-sm" onClick={() => { setUserForm({ ...u, password: '' }); setEr({}) }}>Edit</button>{u.id !== user.id && <button className="btn-danger btn-sm" onClick={() => { update('adminUsers', (l) => l.filter((x) => x.id !== u.id), { action: 'Removed admin user', module: 'Settings', target: u.name }); toast('Admin removed') }}>Remove</button>}</span> },
  ]

  return (
    <div>
      <PageHeader emoji="🔐" title="Roles & Permissions" subtitle="Control which modules each admin role can view and modify."
        actions={edit && (tab === 'roles' ? <button className="btn-primary btn-sm" onClick={() => { setRoleForm({ name: '', description: '' }); setEr({}) }}>+ New role</button> : <button className="btn-primary btn-sm" onClick={() => { setUserForm({ name: '', email: '', password: '', roleId: roles[1].id, status: 'active' }); setEr({}) }}>+ Add admin</button>)} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'roles', label: 'Roles & permissions', count: roles.length }, { id: 'users', label: 'Admin users', count: adminUsers.length }]} />
      {tab === 'roles' ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card pad={false}><ul className="divide-y divide-gray-100">{roles.map((r) => <li key={r.id}><button onClick={() => setSel(r.id)} className={`w-full p-4 text-left transition hover:bg-orange-50 ${role.id === r.id ? 'bg-orange-50' : ''}`}><p className="flex items-center justify-between font-bold">{r.name}{r.system && <Badge tone="gray">System</Badge>}</p><p className="text-xs text-gray-500">{r.description}</p><p className="mt-1 text-xs text-gray-400">{adminUsers.filter((u) => u.roleId === r.id).length} member(s)</p></button></li>)}</ul></Card>
          <Card title={`Permissions — ${role.name}`} action={role.system && <Badge tone="gray">Super Admin permissions can’t be edited</Badge>}>
            <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead><tr className="text-left text-xs uppercase text-gray-500"><th className="py-2">Module</th>{ACTIONS.map((a) => <th key={a} className="py-2 text-center">{a}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">{MODULES.map((m) => <tr key={m}><td className="py-3 font-semibold capitalize">{m}</td>{ACTIONS.map((a) => <td key={a} className="text-center"><input type="checkbox" aria-label={`${role.name} ${a} ${m}`} className="h-4 w-4 accent-brand-500" disabled={!edit || role.system} checked={!!role.permissions[m]?.[a]} onChange={(e) => setPerm(m, a, e.target.checked)} /></td>)}</tr>)}</tbody></table></div>
            <p className="mt-4 text-xs text-gray-400">Tip: log in with another demo account (e.g. ops@foodigo.com) to see how the sidebar adapts to a role.</p>
          </Card>
        </div>
      ) : <Card><DataTable columns={userCols} rows={adminUsers} searchKeys={['name', 'email']} /></Card>}

      <Modal open={!!roleForm} onClose={() => setRoleForm(null)} title="Create role" size="sm" footer={<><button className="btn-outline" onClick={() => setRoleForm(null)}>Cancel</button><button className="btn-primary" onClick={saveRole}>Create</button></>}>
        {roleForm && <div className="space-y-3"><Field label="Role name" error={er.name}><input className={`input ${er.name ? 'input-error' : ''}`} value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /></Field><Field label="Description"><input className="input" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} /></Field></div>}
      </Modal>
      <Modal open={!!userForm} onClose={() => setUserForm(null)} title={userForm?.id ? 'Edit admin' : 'Add admin user'} size="sm" footer={<><button className="btn-outline" onClick={() => setUserForm(null)}>Cancel</button><button className="btn-primary" onClick={saveUser}>Save</button></>}>
        {userForm && <div className="space-y-3">
          <Field label="Full name" error={er.name}><input className={`input ${er.name ? 'input-error' : ''}`} value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></Field>
          <Field label="Email" error={er.email}><input className={`input ${er.email ? 'input-error' : ''}`} value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Field>
          {!userForm.id && <Field label="Temporary password" error={er.password}><input type="password" className={`input ${er.password ? 'input-error' : ''}`} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></Field>}
          <Field label="Role"><select className="input" value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <Field label="Status"><select className="input" value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
        </div>}
      </Modal>
    </div>
  )
}
