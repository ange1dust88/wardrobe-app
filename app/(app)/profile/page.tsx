'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '@/components/AppContext'
import { useAuth } from '@/components/auth/AuthProvider'
import { useItems } from '@/hooks/useItems'
import { useOutfits } from '@/hooks/useOutfits'
import { useProfile } from '@/hooks/useProfile'
import {
  FEATURE_KINDS,
  FEATURE_OPTS,
  ONBOARDING_PALETTES,
  SEASON_META,
  UNDERTONE_OPTIONS,
  WHO_OPTIONS,
  deriveColoring,
  deriveSeason,
  type FeatureKind,
  type Features,
  type PaletteId,
  type Undertone,
  type Who,
} from '@/lib/onboarding'
import { BRAND_ACCENT } from '@/lib/theme'
import { Switch } from '@/components/ui/switch'
import { deleteAccount } from '@/lib/items'
import { cn } from '@/lib/utils'

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'min-h-10 rounded-full border px-3.5 py-1 text-sm capitalize transition-[color,background-color,border-color,transform] active:scale-[0.96]',
        on
          ? 'border-transparent bg-foreground text-white'
          : 'border-border text-foreground hover:bg-muted'
      )}
    >
      {label}
    </button>
  )
}

const UNDERTONE_DOT: Record<Undertone, string> = {
  warm: '#d98a2b',
  cool: '#9aa6bd',
}

const FEATURE_RING_BG = '#f2f4f5'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { showBreakdown, setShowBreakdown, openFeedback } = useAppContext()
  const { profileQuery, saveMutation } = useProfile()
  const { itemsQuery } = useItems()
  const { outfitsQuery } = useOutfits()
  const profile = profileQuery.data

  const itemCount = itemsQuery.data?.length ?? 0
  const outfitCount = outfitsQuery.data?.length ?? 0

  const email = user?.email ?? ''
  const initial = (email[0] ?? 'U').toUpperCase()
  const namePart = email.split('@')[0]?.split(/[._-]/)[0] ?? ''
  const displayName = namePart
    ? namePart.charAt(0).toUpperCase() + namePart.slice(1)
    : 'Your profile'

  const [who, setWho] = useState<Who | null>(profile?.who ?? null)
  const [season, setSeason] = useState<PaletteId | null>(
    profile?.palettes[0] ?? null
  )
  const [seasonManual, setSeasonManual] = useState(false)
  const [features, setFeatures] = useState<Features>({
    hair: profile?.hair ?? null,
    eyes: profile?.eyes ?? null,
    skin: profile?.skin ?? null,
  })
  const [undertone, setUndertone] = useState<Undertone | null>(
    profile?.undertone ?? null
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const persistedWho = profile?.who ?? null
  const persistedSeason = profile?.palettes[0] ?? null
  const dirty =
    who !== persistedWho ||
    season !== persistedSeason ||
    undertone !== (profile?.undertone ?? null) ||
    features.hair !== (profile?.hair ?? null) ||
    features.eyes !== (profile?.eyes ?? null) ||
    features.skin !== (profile?.skin ?? null)

  function pickSeason(id: PaletteId) {
    setSeason(prev => (prev === id ? null : id))
    setSeasonManual(true)
  }

  function pickFeature(kind: FeatureKind, index: number) {
    const next: Features = { ...features, [kind]: index }
    setFeatures(next)
    setSeasonManual(false)
    const derived = deriveSeason(deriveColoring(next), undertone)
    if (derived) setSeason(derived)
  }

  function pickUndertone(value: Undertone) {
    const next = undertone === value ? null : value
    setUndertone(next)
    setSeasonManual(false)
    const derived = deriveSeason(deriveColoring(features), next)
    if (derived) setSeason(derived)
  }

  function resetToFeatures() {
    setSeason(deriveSeason(deriveColoring(features), undertone))
    setSeasonManual(false)
  }

  useEffect(() => {
    if (!dirty || saveMutation.isPending) return
    const timer = window.setTimeout(() => {
      setSaveError(null)
      saveMutation.mutate(
        {
          who,
          climate: profile?.climate ?? null,
          palettes: season ? [season] : [],
          hair: features.hair,
          eyes: features.eyes,
          skin: features.skin,
          undertone,
        },
        { onError: err => setSaveError((err as Error).message) }
      )
    }, 600)
    return () => window.clearTimeout(timer)
  }, [dirty, who, season, features, undertone, profile, saveMutation])

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deleteAccount()
      await signOut()
    } catch (e) {
      setDeleteError((e as Error).message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className='px-6 pt-3 pb-[70px] sm:px-12'>
      <div className='w-full max-w-[660px]'>
        <div className='flex items-center gap-[18px] border-b border-border pb-[26px]'>
          <div className='font-heading flex size-16 flex-none items-center justify-center rounded-full bg-foreground text-[26px] font-extrabold text-background'>
            {initial}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-heading truncate text-[26px] font-extrabold tracking-[-0.02em]'>
              {displayName}
            </div>
            {email && (
              <div className='truncate text-[14px] text-muted-foreground'>
                {email}
              </div>
            )}
            <div className='mt-0.5 text-[12.5px] text-muted-foreground'>
              {itemCount} item{itemCount === 1 ? '' : 's'} · {outfitCount}{' '}
              outfit{outfitCount === 1 ? '' : 's'}
            </div>
          </div>
          <span
            className={cn(
              'flex-none text-[13px] font-medium',
              saveError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {saveMutation.isPending
              ? 'Saving…'
              : saveError
                ? 'Couldn’t save'
                : dirty
                  ? 'Unsaved…'
                  : 'All changes saved'}
          </span>
        </div>

        <div className='mt-[30px] font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
          Who we style
        </div>
        <div className='mt-3 flex flex-wrap gap-2'>
          {WHO_OPTIONS.map(value => (
            <Toggle
              key={value}
              label={value}
              on={who === value}
              onClick={() => setWho(who === value ? null : value)}
            />
          ))}
        </div>

        <div className='mt-[30px] flex items-baseline justify-between gap-3'>
          <span className='font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
            Your colour season
          </span>
          {seasonManual && (
            <button
              type='button'
              onClick={resetToFeatures}
              className='text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground'
            >
              reset to my features
            </button>
          )}
        </div>
        <div className='mt-3 flex flex-wrap gap-3'>
          {ONBOARDING_PALETTES.map(palette => {
            const on = season === palette.id
            return (
              <button
                key={palette.id}
                type='button'
                onClick={() => pickSeason(palette.id)}
                className={cn(
                  'flex flex-col items-center rounded-[12px] border-2 p-2.5 transition-[border-color,transform] active:scale-[0.97]',
                  on ? '' : 'border-border hover:border-foreground/30'
                )}
                style={on ? { borderColor: BRAND_ACCENT } : undefined}
              >
                <div className='grid grid-cols-2 gap-1'>
                  {palette.colors.map(color => (
                    <span
                      key={color}
                      className='size-[26px] rounded-[7px]'
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span className='font-heading mt-[9px] text-[14px] font-bold tracking-[-0.01em]'>
                  {SEASON_META[palette.id].label}
                </span>
              </button>
            )
          })}
        </div>
        <div className='mt-3 text-[13.5px] text-muted-foreground'>
          {season
            ? `Matches tuned to ${SEASON_META[season].label} — ${SEASON_META[season].blurb}.`
            : 'Not set — matches use general colour harmony.'}
        </div>

        <div className='mt-[18px] rounded-[18px] border border-border bg-[#f2f4f5] px-6 py-[22px]'>
          <div className='font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
            Or match it to your features
          </div>
          <div className='mt-[18px] flex flex-col gap-4'>
            {FEATURE_KINDS.map(kind => (
              <div key={kind} className='flex items-center gap-[18px]'>
                <div className='font-mono w-11 flex-none text-[11px] tracking-[0.1em] text-muted-foreground uppercase'>
                  {kind}
                </div>
                <div className='flex gap-[11px]'>
                  {FEATURE_OPTS[kind].map((o, i) => {
                    const on = features[kind] === i
                    return (
                      <button
                        key={i}
                        type='button'
                        aria-label={`${kind} ${i + 1}`}
                        onClick={() => pickFeature(kind, i)}
                        className='size-8 rounded-full transition-transform'
                        style={{
                          background: o.c,
                          transform: on ? 'scale(1.08)' : 'scale(1)',
                          boxShadow: on
                            ? `inset 0 0 0 1px rgba(0,0,0,.08), 0 0 0 2px var(--foreground), 0 0 0 4px ${FEATURE_RING_BG}`
                            : 'inset 0 0 0 1px rgba(0,0,0,.08)',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
            <div className='flex items-center gap-[18px]'>
              <div className='font-mono w-11 flex-none text-[11px] tracking-[0.1em] text-muted-foreground uppercase'>
                Tone
              </div>
              <div className='flex gap-2.5'>
                {UNDERTONE_OPTIONS.map(u => {
                  const on = undertone === u
                  return (
                    <button
                      key={u}
                      type='button'
                      onClick={() => pickUndertone(u)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold capitalize transition-colors',
                        on
                          ? 'border-transparent bg-foreground text-white'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      )}
                    >
                      <span
                        className='size-3 rounded-full'
                        style={{ background: UNDERTONE_DOT[u] }}
                      />
                      {u}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-[30px] flex items-center justify-between gap-3 rounded-[16px] border border-border bg-card p-5'>
          <div>
            <div className='text-[15px] font-bold'>Score breakdown</div>
            <div className='mt-0.5 text-[12.5px] text-muted-foreground'>
              Show the “?” match explainer on the wheel
            </div>
          </div>
          <Switch checked={showBreakdown} onCheckedChange={setShowBreakdown} />
        </div>

        <div className='mt-[26px] font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
          Account
        </div>
        <div className='mt-3 flex flex-wrap gap-2.5'>
          <button
            type='button'
            onClick={openFeedback}
            className='rounded-[11px] border border-border bg-card px-4 py-[11px] text-[13.5px] font-semibold transition-colors hover:bg-muted'
          >
            Send feedback
          </button>
          <button
            type='button'
            onClick={() => signOut()}
            className='rounded-[11px] border border-border bg-card px-4 py-[11px] text-[13.5px] font-semibold transition-colors hover:bg-muted'
          >
            Sign out
          </button>
        </div>

        <div className='mt-[30px] border-t border-border pt-[22px]'>
          <div className='font-mono text-[10.5px] tracking-[0.14em] text-destructive/70 uppercase'>
            Danger zone
          </div>
          <button
            type='button'
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            disabled={deleting}
            className={cn(
              'mt-3 rounded-[11px] border border-destructive/30 bg-destructive/5 px-4 py-[11px] text-[13.5px] font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60',
              confirmDelete && 'bg-destructive/10'
            )}
          >
            {confirmDelete ? 'Delete for good?' : 'Delete account'}
          </button>
          {deleteError && (
            <div className='mt-2 text-[12px] text-destructive'>
              {deleteError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
