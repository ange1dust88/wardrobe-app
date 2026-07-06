import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  type Folder,
} from '@/lib/items'

const FOLDERS_KEY = ['folders'] as const

export function useFolders() {
  const queryClient = useQueryClient()

  const foldersQuery = useQuery<Folder[]>({
    queryKey: FOLDERS_KEY,
    queryFn: fetchFolders,
  })

  const createMutation = useMutation<Folder, Error, string>({
    mutationFn: name => createFolder(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOLDERS_KEY }),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    },
  })

  return { foldersQuery, createMutation, deleteMutation }
}
