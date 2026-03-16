import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'
import { useUser } from '@/apis/UserApi'

interface NotFoundComponentProps {
  headerText?: string
  descriptionText?: string
}

function NotFoundComponent({
  headerText = 'Page not found',
  descriptionText = 'Check the URL and try again. (404)',
}: NotFoundComponentProps) {
  const { data: user } = useUser()

  const handleGoHome = () => {
    if (user) {
      router.navigate({ to: '/goals'}) // logged-in home/dashboard
    } else {
      router.navigate({ to: '/'}) // public landing page
    }
  }
  
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 pt-18 items-center">
      <FileQuestion size={`64px`} strokeWidth={2.5} />
      <div>
        <h2 className="text-base font-black text-center">{headerText}</h2>
        <p className="text-sm font-normal text-center">{descriptionText}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Button onClick={handleGoHome}>Go Home</Button>
      </div>
    </div>
  )
}

export { NotFoundComponent }
