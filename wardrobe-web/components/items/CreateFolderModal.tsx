'use client'

import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  onClose: () => void
  onCreate: (name: string) => void
}

export function CreateFolderModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const canCreate = name.trim().length > 0

  function submit() {
    if (!canCreate) return
    onCreate(name.trim())
    onClose()
  }

  return (
    <Dialog open onOpenChange={next => !next && onClose()}>
      <DialogPopup
        showCloseButton={false}
        className='max-w-[400px] gap-0 rounded-[22px] p-0'
      >
        <div className='flex items-center justify-between gap-4 border-b border-border px-6 py-[18px]'>
          <DialogTitle className='font-heading text-[19px] leading-none font-bold tracking-tight'>
            New folder
          </DialogTitle>
          <DialogClose
            aria-label='Close'
            className='flex size-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            submit()
          }}
          className='p-6'
        >
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g. Work, Casual, Event'
            className='w-full rounded-[12px] border border-border bg-background px-3.5 py-3 text-[15px] outline-none'
          />
          <div className='mt-4 flex items-center justify-end gap-2.5'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='h-11 rounded-[12px]'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!canCreate}
              className='h-11 rounded-[12px] px-6 font-bold'
            >
              Create
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
