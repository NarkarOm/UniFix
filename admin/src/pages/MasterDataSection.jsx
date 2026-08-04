import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { useTheme } from '../theme/ThemeProvider'
import { SectionHeader } from '../components/SharedComponents'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, Bell, X, Check, Loader2,
  Building2, Layers, DoorOpen, Tag, Search,
} from 'lucide-react'

const ICON_OPTIONS = [
  'flash-outline', 'water-outline', 'hammer-outline', 'sparkles-outline',
  'desktop-outline', 'man-outline', 'shield-outline', 'construct-outline',
  'color-palette-outline', 'leaf-outline', 'wifi-outline', 'bulb-outline',
]

const COLOR_OPTIONS = [
  '#f59e0b', '#3b82f6', '#ec4899', '#10b981',
  '#8b5cf6', '#ef4444', '#0ea5e9', '#6b7280',
  '#f97316', '#14b8a6', '#a855f7', '#84cc16',
]

const DESIGNATION_OPTIONS = [
  '', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Technician', 'Safety Officer',
]

function useTokens() {
  return useTheme().tokens
}

function MModal({ title, onClose, children, maxWidth = 500 }) {
  const tokens = useTokens()
  return (
    <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20, backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  const tokens = useTokens()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

function MInput({ style = {}, ...props }) {
  const tokens = useTokens()
  return (
    <input style={{ width: '100%', padding: '9px 12px', background: tokens.inputBg, color: tokens.text, border: `1.5px solid ${tokens.inputBorder}`, borderRadius: tokens.radius.lg, fontSize: 14, outline: 'none', fontFamily: 'inherit', ...style }}
      onFocus={e => e.target.style.borderColor = tokens.inputFocus}
      onBlur={e => e.target.style.borderColor = tokens.inputBorder}
      {...props}
    />
  )
}

function MTextarea({ style = {}, ...props }) {
  const tokens = useTokens()
  return (
    <textarea style={{ width: '100%', padding: '9px 12px', background: tokens.inputBg, color: tokens.text, border: `1.5px solid ${tokens.inputBorder}`, borderRadius: tokens.radius.lg, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none', ...style }}
      onFocus={e => e.target.style.borderColor = tokens.inputFocus}
      onBlur={e => e.target.style.borderColor = tokens.inputBorder}
      rows={3}
      {...props}
    />
  )
}

function MSelect({ children, style = {}, ...props }) {
  const tokens = useTokens()
  return (
    <select style={{ width: '100%', padding: '9px 12px', background: tokens.inputBg, color: tokens.text, border: `1.5px solid ${tokens.inputBorder}`, borderRadius: tokens.radius.lg, fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', ...style }} {...props}>
      {children}
    </select>
  )
}

function MBtn({ variant = 'primary', size = 'md', loading: isLoading, children, style = {}, ...props }) {
  const tokens = useTokens()
  const variants = {
    primary: { background: tokens.primary, color: '#fff', border: 'none' },
    danger: { background: tokens.danger, color: '#fff', border: 'none' },
    ghost: { background: tokens.surfaceHigh, color: tokens.textSecondary, border: `1px solid ${tokens.border}` },
    success: { background: tokens.success, color: '#fff', border: 'none' },
  }
  const sizes = {
    sm: { padding: '5px 10px', fontSize: 12, borderRadius: tokens.radius.md },
    md: { padding: '8px 14px', fontSize: 13, borderRadius: tokens.radius.md },
  }
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: props.disabled ? 0.5 : 1, ...variants[variant], ...sizes[size], ...style }} {...props}>
      {isLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
      {children}
    </button>
  )
}

function MToggle({ value, onChange }) {
  const tokens = useTokens()
  return (
    <button onClick={() => onChange(!value)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
      {value
        ? <ToggleRight size={24} color={tokens.success} />
        : <ToggleLeft size={24} color={tokens.textMuted} />}
    </button>
  )
}

function MBadge({ active }) {
  const tokens = useTokens()
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: tokens.radius.pill, background: active ? tokens.successBg : tokens.surfaceHigh, color: active ? tokens.success : tokens.textMuted, border: `1px solid ${active ? tokens.successBorder : tokens.border}` }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function ConfirmDelete({ message, onConfirm, onCancel, loading: isLoading }) {
  return (
    <MModal title="Confirm Delete" onClose={onCancel}>
      <p style={{ fontSize: 14 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <MBtn variant="ghost" onClick={onCancel}>Cancel</MBtn>
        <MBtn variant="danger" loading={isLoading} onClick={onConfirm}><Trash2 size={13} /> Delete</MBtn>
      </div>
    </MModal>
  )
}

function CategoryTab({ data, onRefresh }) {
  const tokens = useTokens()
  const [expanded, setExpanded] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [showSubCreate, setShowSubCreate] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [editSub, setEditSub] = useState(null)
  const [delCat, setDelCat] = useState(null)
  const [delSub, setDelSub] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', iconName: ICON_OPTIONS[0], color: COLOR_OPTIONS[0], designation: '', displayOrder: 0 })
  const [subForm, setSubForm] = useState({ name: '', displayOrder: 0 })

  const openEdit = (cat) => { setForm({ name: cat.name, iconName: cat.iconName, color: cat.color, designation: cat.designation || '', displayOrder: cat.displayOrder }); setEditCat(cat) }
  const openSubEdit = (sub) => { setSubForm({ name: sub.name, displayOrder: sub.displayOrder }); setEditSub(sub) }

  const saveCategory = async () => {
    setSaving(true)
    try {
      if (editCat) await adminAPI.updateCategory(editCat.id, form)
      else await adminAPI.createCategory(form)
      setShowCreate(false); setEditCat(null); onRefresh()
    } catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const saveSubCategory = async () => {
    setSaving(true)
    try {
      if (editSub) await adminAPI.updateSubCategory(editSub.id, subForm)
      else await adminAPI.createSubCategory({ ...subForm, categoryId: showSubCreate })
      setShowSubCreate(null); setEditSub(null); onRefresh()
    } catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteCategory = async () => {
    setSaving(true)
    try { await adminAPI.deleteCategory(delCat.id); setDelCat(null); onRefresh() }
    catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteSubCategory = async () => {
    setSaving(true)
    try { await adminAPI.deleteSubCategory(delSub.id); setDelSub(null); onRefresh() }
    catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const toggleCat = async (cat) => {
    try { await adminAPI.updateCategory(cat.id, { isActive: !cat.isActive }); onRefresh() }
    catch { alert('Failed') }
  }

  const toggleSub = async (sub) => {
    try { await adminAPI.updateSubCategory(sub.id, { isActive: !sub.isActive }); onRefresh() }
    catch { alert('Failed') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MBtn onClick={() => { setForm({ name: '', iconName: ICON_OPTIONS[0], color: COLOR_OPTIONS[0], designation: '', displayOrder: data.length }); setShowCreate(true) }}>
          <Plus size={13} /> Add Category
        </MBtn>
      </div>

      {data.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', color: tokens.textMuted, fontSize: 14 }}>No categories yet.</div>}

      {data.map(cat => (
        <div key={cat.id} style={{ border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.xl, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: tokens.surface }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.textMuted, padding: 0 }} onClick={() => setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }))}>
              {expanded[cat.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div style={{ width: 28, height: 28, borderRadius: tokens.radius.md, background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: cat.color }}>{cat.name[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{cat.name}</span>
                <MBadge active={cat.isActive} />
              </div>
              <div style={{ fontSize: 11, color: tokens.textMuted }}>{cat.designation || 'No staff mapping'} · {cat.subCategories?.length ?? 0} sub-issues · Order {cat.displayOrder}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MToggle value={cat.isActive} onChange={() => toggleCat(cat)} />
              <MBtn size="sm" variant="ghost" onClick={() => openEdit(cat)}><Pencil size={11} /></MBtn>
              <MBtn size="sm" variant="danger" onClick={() => setDelCat(cat)}><Trash2 size={11} /></MBtn>
            </div>
          </div>

          {expanded[cat.id] && (
            <div style={{ background: tokens.surfaceLow, borderTop: `1px solid ${tokens.border}`, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.subCategories?.map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: tokens.surface, borderRadius: tokens.radius.lg, padding: '9px 12px', border: `1px solid ${tokens.border}` }}>
                  <span style={{ fontSize: 13, color: tokens.textSecondary, flex: 1 }}>{sub.name}</span>
                  <MBadge active={sub.isActive} />
                  <span style={{ fontSize: 11, color: tokens.textMuted }}>#{sub.displayOrder}</span>
                  <MToggle value={sub.isActive} onChange={() => toggleSub(sub)} />
                  <MBtn size="sm" variant="ghost" onClick={() => openSubEdit(sub)}><Pencil size={11} /></MBtn>
                  <MBtn size="sm" variant="danger" onClick={() => setDelSub(sub)}><Trash2 size={11} /></MBtn>
                </div>
              ))}
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tokens.success, fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 4px', fontFamily: 'inherit' }}
                onClick={() => { setSubForm({ name: '', displayOrder: cat.subCategories?.length ?? 0 }); setShowSubCreate(cat.id) }}>
                <Plus size={13} /> Add Sub-issue
              </button>
            </div>
          )}
        </div>
      ))}

      {(showCreate || editCat) && (
        <MModal title={editCat ? 'Edit Category' : 'New Category'} onClose={() => { setShowCreate(false); setEditCat(null) }}>
          <Field label="Name"><MInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electrical" /></Field>
          <Field label="Icon Name">
            <MSelect value={form.iconName} onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))}>
              {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </MSelect>
          </Field>
          <Field label="Color">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${form.color === c ? '#000' : 'transparent'}`, background: c, cursor: 'pointer' }} />
              ))}
            </div>
          </Field>
          <Field label="Staff Designation">
            <MSelect value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}>
              {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d || '— None —'}</option>)}
            </MSelect>
          </Field>
          <Field label="Display Order"><MInput type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} /></Field>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <MBtn variant="ghost" onClick={() => { setShowCreate(false); setEditCat(null) }}>Cancel</MBtn>
            <MBtn loading={saving} onClick={saveCategory}><Check size={13} /> Save</MBtn>
          </div>
        </MModal>
      )}

      {(showSubCreate || editSub) && (
        <MModal title={editSub ? 'Edit Sub-issue' : 'New Sub-issue'} onClose={() => { setShowSubCreate(null); setEditSub(null) }}>
          <Field label="Name"><MInput value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. AC not working" /></Field>
          <Field label="Display Order"><MInput type="number" value={subForm.displayOrder} onChange={e => setSubForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} /></Field>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <MBtn variant="ghost" onClick={() => { setShowSubCreate(null); setEditSub(null) }}>Cancel</MBtn>
            <MBtn loading={saving} onClick={saveSubCategory}><Check size={13} /> Save</MBtn>
          </div>
        </MModal>
      )}

      {delCat && <ConfirmDelete message={`Delete category "${delCat.name}" and all its sub-issues?`} onConfirm={deleteCategory} onCancel={() => setDelCat(null)} loading={saving} />}
      {delSub && <ConfirmDelete message={`Delete sub-issue "${delSub.name}"?`} onConfirm={deleteSubCategory} onCancel={() => setDelSub(null)} loading={saving} />}
    </div>
  )
}

function RoomRow({ room, onEdit, onDelete, onToggle, onRemark }) {
  const tokens = useTokens()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: '9px 12px' }}>
      <DoorOpen size={13} color={tokens.textMuted} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: tokens.text }}>Room {room.roomNumber}</span>
          <span style={{ fontSize: 12, color: tokens.textSecondary }}>{room.roomName}</span>
          <MBadge active={room.isActive} />
        </div>
        {room.remark && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, color: tokens.warning, background: tokens.warningBg, borderRadius: tokens.radius.sm, padding: '2px 6px' }}>
            <Bell size={9} /> {room.remark}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <MBtn size="sm" variant="ghost" onClick={onRemark}><Bell size={11} /></MBtn>
        <MBtn size="sm" variant="ghost" onClick={onEdit}><Pencil size={11} /></MBtn>
        <MToggle value={room.isActive} onChange={onToggle} />
        <MBtn size="sm" variant="danger" onClick={onDelete}><Trash2 size={11} /></MBtn>
      </div>
    </div>
  )
}

function BuildingsTab({ data, onRefresh }) {
  const tokens = useTokens()
  const [expanded, setExpanded] = useState({})
  const [expandedFloor, setExpandedFloor] = useState({})
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [delItem, setDelItem] = useState(null)
  const [remarkModal, setRemarkModal] = useState(null)
  const [remarkText, setRemarkText] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({})

  const openModal = (type, item = null, parentId = null) => {
    if (type === 'building') setForm(item ? { name: item.name, code: item.code } : { name: '', code: '' })
    if (type === 'floor') setForm(item ? { floorNumber: item.floorNumber, floorName: item.floorName } : { floorNumber: 0, floorName: '' })
    if (type === 'room') setForm(item ? { roomNumber: item.roomNumber, roomName: item.roomName } : { roomNumber: '', roomName: '' })
    setModal({ type, item, parentId })
  }

  const save = async () => {
    setSaving(true)
    try {
      const { type, item, parentId } = modal
      if (type === 'building') { if (item) await adminAPI.updateBuilding(item.id, form); else await adminAPI.createBuilding(form) }
      else if (type === 'floor') { if (item) await adminAPI.updateFloor(item.id, form); else await adminAPI.createFloor({ ...form, buildingId: parentId }) }
      else if (type === 'room') { if (item) await adminAPI.updateRoom(item.id, form); else await adminAPI.createRoom({ ...form, buildingId: parentId?.buildingId, floorId: parentId?.floorId || null }) }
      setModal(null); onRefresh()
    } catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      const { type, item } = delItem
      if (type === 'building') await adminAPI.deleteBuilding(item.id)
      else if (type === 'floor') await adminAPI.deleteFloor(item.id)
      else if (type === 'room') await adminAPI.deleteRoom(item.id)
      setDelItem(null); onRefresh()
    } catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const toggle = async (type, item) => {
    try {
      if (type === 'building') await adminAPI.updateBuilding(item.id, { isActive: !item.isActive })
      else if (type === 'floor') await adminAPI.updateFloor(item.id, { isActive: !item.isActive })
      else if (type === 'room') await adminAPI.updateRoom(item.id, { isActive: !item.isActive })
      onRefresh()
    } catch { alert('Failed') }
  }

  const saveRemark = async () => {
    setSaving(true)
    try { await adminAPI.updateRoom(remarkModal.id, { remark: remarkText.trim() || null }); setRemarkModal(null); setRemarkText(''); onRefresh() }
    catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const allRooms = data.flatMap(b => b.rooms || [])
  const filteredRooms = search.trim()
    ? allRooms.filter(r => r.roomNumber.toLowerCase().includes(search.toLowerCase()) || r.roomName.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: tokens.surfaceLow, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: '9px 12px', flex: 1, maxWidth: 320 }}>
          <Search size={14} color={tokens.textMuted} />
          <input style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: tokens.text, flex: 1, fontFamily: 'inherit' }} placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <MBtn onClick={() => openModal('building')}><Plus size={13} /> Add Building</MBtn>
      </div>

      {filteredRooms ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: tokens.textMuted, fontWeight: 600 }}>{filteredRooms.length} room(s) found</div>
          {filteredRooms.map(room => {
            const building = data.find(b => b.id === room.buildingId)
            return (
              <div key={room.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: '10px 14px' }}>
                <DoorOpen size={15} color={tokens.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>Room {room.roomNumber}</span>
                    <span style={{ fontSize: 12, color: tokens.textSecondary }}>{room.roomName}</span>
                    <MBadge active={room.isActive} />
                  </div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{building?.name}</div>
                  {room.remark && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: tokens.warning, background: tokens.warningBg, borderRadius: tokens.radius.md, padding: '4px 8px' }}><Bell size={10} /> {room.remark}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <MBtn size="sm" variant="ghost" onClick={() => { setRemarkModal(room); setRemarkText(room.remark || '') }}><Bell size={11} /></MBtn>
                  <MBtn size="sm" variant="ghost" onClick={() => openModal('room', room)}><Pencil size={11} /></MBtn>
                  <MToggle value={room.isActive} onChange={() => toggle('room', room)} />
                  <MBtn size="sm" variant="danger" onClick={() => setDelItem({ type: 'room', item: room })}><Trash2 size={11} /></MBtn>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        data.map(building => (
          <div key={building.id} style={{ border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.xl, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: tokens.surface }}>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.textMuted, padding: 0 }} onClick={() => setExpanded(e => ({ ...e, [building.id]: !e[building.id] }))}>
                {expanded[building.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <Building2 size={16} color={tokens.textSecondary} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{building.name}</span>
                  <span style={{ fontSize: 11, color: tokens.textMuted, fontFamily: 'monospace' }}>{building.code}</span>
                  <MBadge active={building.isActive} />
                </div>
                <div style={{ fontSize: 11, color: tokens.textMuted }}>{building.floors?.length ?? 0} floors · {building.rooms?.length ?? 0} rooms</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MBtn size="sm" variant="ghost" onClick={() => openModal('floor', null, building.id)}><Plus size={11} /> Floor</MBtn>
                <MBtn size="sm" variant="ghost" onClick={() => openModal('room', null, { buildingId: building.id })}><Plus size={11} /> Room</MBtn>
                <MToggle value={building.isActive} onChange={() => toggle('building', building)} />
                <MBtn size="sm" variant="ghost" onClick={() => openModal('building', building)}><Pencil size={11} /></MBtn>
                <MBtn size="sm" variant="danger" onClick={() => setDelItem({ type: 'building', item: building })}><Trash2 size={11} /></MBtn>
              </div>
            </div>

            {expanded[building.id] && (
              <div style={{ background: tokens.surfaceLow, borderTop: `1px solid ${tokens.border}` }}>
                {building.floors?.map(floor => (
                  <div key={floor.id} style={{ borderBottom: `1px solid ${tokens.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: tokens.surfaceLow }}>
                      <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.textMuted, padding: 0 }} onClick={() => setExpandedFloor(e => ({ ...e, [floor.id]: !e[floor.id] }))}>
                        {expandedFloor[floor.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      <Layers size={13} color={tokens.textMuted} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: tokens.textSecondary, flex: 1 }}>{floor.floorName} (Floor {floor.floorNumber})</span>
                      <MBadge active={floor.isActive} />
                      <MToggle value={floor.isActive} onChange={() => toggle('floor', floor)} />
                      <MBtn size="sm" variant="ghost" onClick={() => openModal('floor', floor)}><Pencil size={11} /></MBtn>
                      <MBtn size="sm" variant="danger" onClick={() => setDelItem({ type: 'floor', item: floor })}><Trash2 size={11} /></MBtn>
                    </div>
                    {expandedFloor[floor.id] && (
                      <div style={{ padding: '8px 36px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {building.rooms?.filter(r => r.floorId === floor.id).map(room => (
                          <RoomRow key={room.id} room={room} onEdit={() => openModal('room', room)} onDelete={() => setDelItem({ type: 'room', item: room })} onToggle={() => toggle('room', room)} onRemark={() => { setRemarkModal(room); setRemarkText(room.remark || '') }} />
                        ))}
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tokens.success, fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', fontFamily: 'inherit' }} onClick={() => openModal('room', null, { buildingId: building.id, floorId: floor.id })}>
                          <Plus size={12} /> Add Room to this floor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {building.rooms?.filter(r => !r.floorId).map(room => (
                    <RoomRow key={room.id} room={room} onEdit={() => openModal('room', room)} onDelete={() => setDelItem({ type: 'room', item: room })} onToggle={() => toggle('room', room)} onRemark={() => { setRemarkModal(room); setRemarkText(room.remark || '') }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {modal && (
        <MModal title={modal.item ? `Edit ${modal.type}` : `New ${modal.type}`} onClose={() => setModal(null)}>
          {modal.type === 'building' && (<>
            <Field label="Building Name"><MInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Building" /></Field>
            <Field label="Code"><MInput value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. MAIN" /></Field>
          </>)}
          {modal.type === 'floor' && (<>
            <Field label="Floor Number"><MInput type="number" value={form.floorNumber} onChange={e => setForm(f => ({ ...f, floorNumber: parseInt(e.target.value) || 0 }))} /></Field>
            <Field label="Floor Name"><MInput value={form.floorName} onChange={e => setForm(f => ({ ...f, floorName: e.target.value }))} placeholder="e.g. Ground Floor" /></Field>
          </>)}
          {modal.type === 'room' && (<>
            <Field label="Room Number"><MInput value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} placeholder="e.g. 214" /></Field>
            <Field label="Room Name"><MInput value={form.roomName} onChange={e => setForm(f => ({ ...f, roomName: e.target.value }))} placeholder="e.g. Classroom 1" /></Field>
          </>)}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <MBtn variant="ghost" onClick={() => setModal(null)}>Cancel</MBtn>
            <MBtn loading={saving} onClick={save}><Check size={13} /> Save</MBtn>
          </div>
        </MModal>
      )}

      {remarkModal && (
        <MModal title={`Room ${remarkModal.roomNumber} — Notice`} onClose={() => { setRemarkModal(null); setRemarkText('') }}>
          <p style={{ fontSize: 12, color: tokens.textMuted }}>This notice will be pushed to all users via FCM immediately.</p>
          <Field label="Notice / Remark"><MTextarea value={remarkText} onChange={e => setRemarkText(e.target.value)} placeholder="e.g. AC not working, Room under maintenance..." /></Field>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            {remarkModal.remark && <MBtn variant="ghost" loading={saving} onClick={() => { setRemarkText(''); saveRemark() }}>Clear Notice</MBtn>}
            <MBtn variant="ghost" onClick={() => { setRemarkModal(null); setRemarkText('') }}>Cancel</MBtn>
            <MBtn variant="success" loading={saving} onClick={saveRemark}><Bell size={13} /> Save & Notify</MBtn>
          </div>
        </MModal>
      )}

      {delItem && <ConfirmDelete message={`Delete this ${delItem.type}? This cannot be undone.`} onConfirm={del} onCancel={() => setDelItem(null)} loading={saving} />}
    </div>
  )
}

function LFCategoryTab({ data, onRefresh }) {
  const tokens = useTokens()
  const [showCreate, setShowCreate] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [delItem, setDelItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'found', displayOrder: 0 })

  const found = data.filter(c => c.type === 'found')
  const lost = data.filter(c => c.type === 'lost')

  const save = async () => {
    setSaving(true)
    try {
      if (editItem) await adminAPI.updateLFCategory(editItem.id, { name: form.name, displayOrder: form.displayOrder })
      else await adminAPI.createLFCategory(form)
      setShowCreate(null); setEditItem(null); onRefresh()
    } catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try { await adminAPI.deleteLFCategory(delItem.id); setDelItem(null); onRefresh() }
    catch (e) { alert(e?.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const toggle = async (item) => {
    try { await adminAPI.updateLFCategory(item.id, { isActive: !item.isActive }); onRefresh() }
    catch { alert('Failed') }
  }

  const renderList = (items, type) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tokens.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type === 'found' ? 'Found Item Categories' : 'Lost Item Categories'}</span>
        <MBtn size="sm" onClick={() => { setForm({ name: '', type, displayOrder: items.length }); setShowCreate(type) }}><Plus size={11} /> Add</MBtn>
      </div>
      {items.length === 0 && <div style={{ fontSize: 13, color: tokens.textMuted, padding: '16px 0', textAlign: 'center' }}>None yet</div>}
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: '10px 14px' }}>
          <Tag size={13} color={tokens.textMuted} />
          <span style={{ fontSize: 13, color: tokens.textSecondary, flex: 1 }}>{item.name}</span>
          <MBadge active={item.isActive} />
          <span style={{ fontSize: 11, color: tokens.textMuted }}>#{item.displayOrder}</span>
          <MToggle value={item.isActive} onChange={() => toggle(item)} />
          <MBtn size="sm" variant="ghost" onClick={() => { setForm({ name: item.name, type: item.type, displayOrder: item.displayOrder }); setEditItem(item) }}><Pencil size={11} /></MBtn>
          <MBtn size="sm" variant="danger" onClick={() => setDelItem(item)}><Trash2 size={11} /></MBtn>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {renderList(found, 'found')}
      <div style={{ borderTop: `1px solid ${tokens.border}` }} />
      {renderList(lost, 'lost')}

      {(showCreate || editItem) && (
        <MModal title={editItem ? 'Edit Category' : `New ${showCreate} Category`} onClose={() => { setShowCreate(null); setEditItem(null) }}>
          <Field label="Name"><MInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" /></Field>
          <Field label="Display Order"><MInput type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} /></Field>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <MBtn variant="ghost" onClick={() => { setShowCreate(null); setEditItem(null) }}>Cancel</MBtn>
            <MBtn loading={saving} onClick={save}><Check size={13} /> Save</MBtn>
          </div>
        </MModal>
      )}

      {delItem && <ConfirmDelete message={`Delete "${delItem.name}"?`} onConfirm={del} onCancel={() => setDelItem(null)} loading={saving} />}
    </div>
  )
}

export default function MasterDataSection({ data, loading, onRefresh }) {
  const { tokens } = useTheme()
  const [activeTab, setActiveTab] = useState('categories')

  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_API_URL
    const es = new EventSource(`${BASE_URL}/master/stream`)
    const refresh = () => onRefresh()
    const events = ['category_created','category_updated','category_deleted','subcategory_created','subcategory_updated','subcategory_deleted','building_created','building_updated','building_deleted','floor_created','floor_updated','floor_deleted','room_created','room_updated','room_deleted','lf_category_created','lf_category_updated','lf_category_deleted']
    events.forEach(ev => es.addEventListener(ev, refresh))
    return () => es.close()
  }, [onRefresh])

  const tabs = [
    { key: 'categories', label: 'Categories & Sub-issues', Icon: Tag },
    { key: 'buildings', label: 'Buildings, Floors & Rooms', Icon: Building2 },
    { key: 'lfcategories', label: 'Lost & Found Categories', Icon: Layers },
  ]

  return (
    <div>
      <SectionHeader title="Master Data Management" subtitle="Manage all configurable business data — changes reflect instantly across the app" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: tokens.radius.lg,
              border: `1.5px solid ${activeTab === tab.key ? tokens.primary : tokens.border}`,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === tab.key ? tokens.primary : tokens.surface,
              color: activeTab === tab.key ? '#fff' : tokens.textSecondary,
              transition: 'all 0.15s',
            }}
          >
            <tab.Icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, border: `1px solid ${tokens.border}`, padding: 20, boxShadow: tokens.shadow, minHeight: 300 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
            <Loader2 size={24} color={tokens.textMuted} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {activeTab === 'categories' && <CategoryTab data={data?.categories ?? []} onRefresh={onRefresh} />}
            {activeTab === 'buildings' && <BuildingsTab data={data?.buildings ?? []} onRefresh={onRefresh} />}
            {activeTab === 'lfcategories' && <LFCategoryTab data={data?.lfCategories ?? []} onRefresh={onRefresh} />}
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}