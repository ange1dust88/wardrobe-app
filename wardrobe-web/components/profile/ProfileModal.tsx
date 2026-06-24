'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useProfile } from '@/hooks/useProfile'
import {
  CLIMATE_OPTIONS,
  MAX_PALETTES,
  ONBOARDING_PALETTES,
  WHO_OPTIONS,
  type Climate,
  type PaletteId,
  type Who,
} from '@/lib/onboarding'
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  onClose: () => void
  itemCount: number
  outfitCount: number
}

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
        'min-h-10 rounded-full border px-3 py-1 text-sm capitalize transition-[color,background-color,border-color,transform] active:scale-[0.96]',
        on ? 'border-black bg-black text-white' : 'border-black/30 text-black'
      )}
    >
      {label}
    </button>
  )
}

export function ProfileModal({ onClose, itemCount, outfitCount }: Props) {
  const { user, signOut } = useAuth()
  const { profileQuery, saveMutation } = useProfile()
  const profile = profileQuery.data

  const [who, setWho] = useState<Who | null>(profile?.who ?? null)
  const [climate, setClimate] = useState<Climate | null>(
    profile?.climate ?? null
  )
  const [palettes, setPalettes] = useState<PaletteId[]>(profile?.palettes ?? [])

  function togglePalette(value: PaletteId) {
    setPalettes(prev => {
      if (prev.includes(value)) return prev.filter(p => p !== value)
      const next = [...prev, value]
      if (next.length > MAX_PALETTES) next.shift()
      return next
    })
  }

  function save() {
    saveMutation.mutate(
      { who, climate, palettes },
      {
        onSuccess: onClose,
      }
    )
  }

  return (
    <Dialog
      open
      onOpenChange={next => {
        if (!next) onClose()
      }}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <span className='text-sm font-medium text-black'>
                {user?.email ?? 'Signed in'}
              </span>
              <span className='text-sm text-muted-foreground'>
                {itemCount} item{itemCount === 1 ? '' : 's'} · {outfitCount}{' '}
                outfit{outfitCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Who
              </span>
              <div className='flex flex-wrap gap-2'>
                {WHO_OPTIONS.map(value => (
                  <Toggle
                    key={value}
                    label={value}
                    on={who === value}
                    onClick={() => setWho(who === value ? null : value)}
                  />
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Climate
              </span>
              <div className='flex flex-wrap gap-2'>
                {CLIMATE_OPTIONS.map(value => (
                  <Toggle
                    key={value}
                    label={value}
                    on={climate === value}
                    onClick={() => setClimate(climate === value ? null : value)}
                  />
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Palettes
              </span>
              <div className='flex flex-wrap gap-3'>
                {ONBOARDING_PALETTES.map(palette => {
                  const selected = palettes.includes(palette.id)
                  return (
                    <button
                      key={palette.id}
                      type='button'
                      onClick={() => togglePalette(palette.id)}
                      className={cn(
                        'flex min-h-10 flex-col items-center gap-1 rounded-lg border p-2 transition-[border-color,transform] active:scale-[0.96]',
                        selected ? 'border-black' : 'border-transparent'
                      )}
                    >
                      <div className='grid grid-cols-2 gap-0.5'>
                        {palette.colors.map(color => (
                          <span
                            key={color}
                            className='size-5 rounded'
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <span className='text-xs capitalize'>{palette.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='flex items-center justify-between gap-2 pt-2'>
              <Button variant='outline' onClick={() => signOut()}>
                Sign out
              </Button>
              <Button onClick={save} loading={saveMutation.isPending}>
                Save
              </Button>
            </div>
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
