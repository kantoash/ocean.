import React from 'react'
import { Avatar, AvatarImage } from '@/src/components/ui/avatar'
import { cn } from '@/src/lib/utils'

export const UserAvatar = ({ image }: {
    image?: string | null
}) => {


  return (
    <Avatar className={cn('bg-white text-black border border-gray-200 shadow-lg ')}>
         <AvatarImage  src={ image || "/placeholder.jpg"} />
    </Avatar>
  )
}
