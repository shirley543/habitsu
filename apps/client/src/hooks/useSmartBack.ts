import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router"

export function useSmartBack(fallback: string = '/goals') {
  const navigate = useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  
  const navigateBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      navigate({ to: fallback })
    }
  }

  return navigateBack;
}
