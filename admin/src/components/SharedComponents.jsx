import { memo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { STATUS, VERIFICATION } from '../constants'

export const StatusBadge = memo(({ status, verification }) => {
  const { tokens } = useTheme()
  const statusStyles = {
    pending: { bg: tokens.badgePendingBg, color: tokens.badgePendingText, border: tokens.badgePendingBorder, label: 'Pending' },
    assigned: { bg: tokens.badgeAssignedBg, color: tokens.badgeAssignedText, border: tokens.badgeAssignedBorder, label: 'Assigned' },
    in_progress: { bg: tokens.badgeProgressBg, color: tokens.badgeProgressText, border: tokens.badgeProgressBorder, label: 'In Progress' },
    completed: { bg: tokens.badgeCompletedBg, color: tokens.badgeCompletedText, border: tokens.badgeCompletedBorder, label: 'Completed' },
    rejected: { bg: tokens.badgeRejectedBg, color: tokens.badgeRejectedText, border: tokens.badgeRejectedBorder, label: 'Rejected' },
  }
  const verificationStyles = {
    pending: { bg: tokens.badgePendingBg, color: tokens.badgePendingText, border: tokens.badgePendingBorder, label: 'Pending' },
    approved: { bg: tokens.badgeCompletedBg, color: tokens.badgeCompletedText, border: tokens.badgeCompletedBorder, label: 'Approved' },
    rejected: { bg: tokens.badgeRejectedBg, color: tokens.badgeRejectedText, border: tokens.badgeRejectedBorder, label: 'Rejected' },
  }
  const meta = status
    ? (statusStyles[status] ?? statusStyles.pending)
    : (verificationStyles[verification] ?? verificationStyles.pending)

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: tokens.radius.pill, whiteSpace: 'nowrap',
      border: `1px solid ${meta.border}`,
      background: meta.bg, color: meta.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  )
})

export function EmptyState({ icon: Icon, text, sub }) {
  const { tokens } = useTheme()
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: tokens.radius.xl,
        background: tokens.primaryLight, display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
      }}>
        <Icon size={24} color={tokens.primary} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>{text}</div>
      {sub && <div style={{ fontSize: 13, color: tokens.textMuted }}>{sub}</div>}
    </div>
  )
}

export function SectionHeader({ title, subtitle }) {
  const { tokens } = useTheme()
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: tokens.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 400 }}>{subtitle}</p>}
    </div>
  )
}

export function ThemeToggle() {
  const { mode, setLight, setDark, tokens } = useTheme()
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: tokens.radius.md,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    fontSize: 12, fontWeight: 600,
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: tokens.surfaceHigh,
      border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radius.md,
      padding: 2, gap: 2,
    }}>
      <button
        onClick={setLight}
        style={{
          ...base,
          background: mode === 'light' ? tokens.surface : 'transparent',
          color: mode === 'light' ? tokens.primary : tokens.textMuted,
          boxShadow: mode === 'light' ? tokens.shadow : 'none',
        }}
        title="Light theme"
      >
        <Sun size={14} />
      </button>
      <button
        onClick={setDark}
        style={{
          ...base,
          background: mode === 'dark' ? tokens.surface : 'transparent',
          color: mode === 'dark' ? tokens.primary : tokens.textMuted,
          boxShadow: mode === 'dark' ? tokens.shadow : 'none',
        }}
        title="Dark theme"
      >
        <Moon size={14} />
      </button>
    </div>
  )
}

export function Card({ children, style = {} }) {
  const { tokens } = useTheme()
  return (
    <div style={{
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radius.xxl,
      boxShadow: tokens.shadow,
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Btn({ variant = 'primary', size = 'md', loading, children, style = {}, ...props }) {
  const { tokens } = useTheme()
  const variants = {
    primary: { background: tokens.primary, color: '#fff', border: 'none' },
    danger: { background: tokens.danger, color: '#fff', border: 'none' },
    ghost: { background: tokens.surfaceHigh, color: tokens.textSecondary, border: `1px solid ${tokens.border}` },
    success: { background: tokens.success, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: tokens.text, border: `1px solid ${tokens.border}` },
  }
  const sizes = {
    sm: { padding: '5px 10px', fontSize: 12, borderRadius: tokens.radius.md },
    md: { padding: '8px 14px', fontSize: 13, borderRadius: tokens.radius.md },
    lg: { padding: '11px 20px', fontSize: 14, borderRadius: tokens.radius.lg },
  }
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: 'inherit', ...variants[variant], ...sizes[size],
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ style = {}, ...props }) {
  const { tokens } = useTheme()
  return (
    <input
      style={{
        width: '100%', padding: '9px 12px',
        background: tokens.inputBg, color: tokens.text,
        border: `1.5px solid ${tokens.inputBorder}`,
        borderRadius: tokens.radius.lg, fontSize: 14,
        outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = tokens.inputFocus}
      onBlur={e => e.target.style.borderColor = tokens.inputBorder}
      {...props}
    />
  )
}

export function Textarea({ style = {}, ...props }) {
  const { tokens } = useTheme()
  return (
    <textarea
      style={{
        width: '100%', padding: '10px 12px',
        background: tokens.inputBg, color: tokens.text,
        border: `1.5px solid ${tokens.inputBorder}`,
        borderRadius: tokens.radius.lg, fontSize: 14,
        outline: 'none', fontFamily: 'inherit',
        resize: 'vertical', transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = tokens.inputFocus}
      onBlur={e => e.target.style.borderColor = tokens.inputBorder}
      {...props}
    />
  )
}

export function Select({ children, style = {}, ...props }) {
  const { tokens } = useTheme()
  return (
    <select
      style={{
        width: '100%', padding: '9px 12px',
        background: tokens.inputBg, color: tokens.text,
        border: `1.5px solid ${tokens.inputBorder}`,
        borderRadius: tokens.radius.lg, fontSize: 14,
        outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.15s', cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function Modal({ title, onClose, children, maxWidth = 500 }) {
  const { tokens } = useTheme()
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: tokens.modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: 20, backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tokens.surface, borderRadius: tokens.radius.xxl,
          width: '100%', maxWidth, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: tokens.shadowModal,
          border: `1px solid ${tokens.border}`,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: tokens.radius.md,
              background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: tokens.textSecondary,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  const { tokens } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: tokens.radius.md,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s', fontFamily: 'inherit',
            border: `1.5px solid ${active === tab.key ? tokens.primary : tokens.border}`,
            background: active === tab.key ? tokens.primary : tokens.surface,
            color: active === tab.key ? '#fff' : tokens.textSecondary,
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '1px 6px', borderRadius: tokens.radius.pill,
              background: active === tab.key ? 'rgba(255,255,255,0.2)' : tokens.surfaceHigh,
              color: active === tab.key ? '#fff' : tokens.textMuted,
            }}>
              {tab.count ?? 0}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}