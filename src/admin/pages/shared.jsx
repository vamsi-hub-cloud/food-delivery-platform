// small shared helpers for admin pages
export { default as Reveal } from '../../components/Reveal'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Modal } from '../components/ui'

// tab state kept in the URL (?tab=)
export function useTab(def) {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || def
  const setTab = (t) => { const p = new URLSearchParams(params); p.set('tab', t); setParams(p, { replace: true }) }
  return [tab, setTab]
}

// confirm modal that optionally collects a reason
export function ReasonModal({ open, title, text, confirmLabel = 'Confirm', danger, requireReason = true, onClose, onConfirm, extra }) {
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const go = () => {
    if (requireReason && reason.trim().length < 3) return setErr('Please enter a reason (min. 3 characters)')
    onConfirm(reason.trim()); setReason(''); setErr('')
  }
  return (
    <Modal open={open} onClose={() => { setReason(''); setErr(''); onClose() }} title={title} size="sm"
      footer={<><button className="btn-outline" onClick={onClose}>Cancel</button><button className={danger ? 'btn-danger' : 'btn-primary'} onClick={go}>{confirmLabel}</button></>}>
      {text && <p className="mb-3 text-sm text-gray-600">{text}</p>}
      {extra}
      {requireReason !== null && (
        <>
          <label className="label">Reason{requireReason ? '' : ' (optional)'}</label>
          <textarea rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setErr('') }} className={`input resize-none ${err ? 'input-error' : ''}`} placeholder="Type here…" />
          {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
        </>
      )}
    </Modal>
  )
}
