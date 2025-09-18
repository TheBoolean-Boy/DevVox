"use client"
import useProject from '@/hooks/use-project'
import { ExternalLink, Github, Plus } from 'lucide-react'
import Link from 'next/link'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import MeetingCard from './meeting-card'
import { Button } from '@/components/ui/button'
import ArchiveButton from './archive-button'

const dashboard = () => {
  const { project } = useProject()

  return (
    <div>
      {/* {project?.id} */}
    <div className="flex items-center justify-between flex-wrap gap-y-4">

      {/* Github Link */}
      <div className="w-fit rounded-md bg-primary px-4 py-3">
        <div className="flex items-center">
          <Github className="size-5 text-white" />
          <h3 className="text-sm font-medium ml-2 text-white">
            This project is linked to {'  '}
          </h3>
          <Link href={project?.githubUrl ?? " "}>
            <div className="inline-flex items-center text-white/80 hover:underline">
              {project?.githubUrl}
              <ExternalLink className="ml-1 size-4" />
            </div>
          </Link>
        </div>
      </div>

      <div className=' h-4'></div>

      <div className='flex items-center gap-4'>
        {/* TeamMembers */}
        {/* InviteButton */}
        {/* <Button variant={'outline'}> <Plus/> Invite teammates</Button> */}
        <ArchiveButton />
      </div>
      
    </div>

    <div className=' mt-4'>

      <div className=' grid grid-cols-1 gap-4 sm:grid-cols-5'>
        <AskQuestionCard />
        <MeetingCard />
      </div>


    </div>

    <div className=' mt-8'>
      <CommitLog />
    </div>

    </div>

  )
}

export default dashboard
