import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, saveProfile, type UserProfile } from '@/lib/profile'

export function useProfile() {
  const queryClient = useQueryClient()

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: Infinity,
  })

  const saveMutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: profile => queryClient.setQueryData(['profile'], profile),
  })

  return { profileQuery, saveMutation }
}
