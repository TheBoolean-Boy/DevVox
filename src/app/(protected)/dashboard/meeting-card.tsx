"use client"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
// import { useRouter } from 'next/router'

const MeetingCard = () => {
  const { project } = useProject();

  const processMeeting = useMutation({
    mutationFn: async ( data: { meetingUrl:string, meetingId:string, projectId:string }) => {
      const { meetingUrl, meetingId, projectId } = data;
      const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId });
      return response.data;
    },
  });

  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const router = useRouter()
  const uploadMeetig = api.project.uploadMeeting.useMutation()

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      console.log(acceptedFiles)
      const file = acceptedFiles[0]
      const downloadUrl = await uploadFile(file as File, setProgress) as string
      if (!file) toast.warning("Please upload an audio file!")
      uploadMeetig.mutate({
        projectId: project!.id,
        meetingUrl: downloadUrl,
        name: file!.name
      }, {
        onSuccess: (meeting) => {
          toast.success("Meeting uploaded successfully")
          router.push("/meetings")
          processMeeting.mutateAsync({meetingUrl: downloadUrl, meetingId: meeting.id, projectId:project!.id})
        },
        onError: () => {
          toast.error("Failed to process your file")
        }
      })
      window.alert(downloadUrl)
      setIsUploading(false)
    }
  })
  return (
    <Card className=' col-span-2 flex flex-col items-center justify-center py-4' {...getRootProps()}>
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-1 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-0 text-center text-sm text-gray-500">
            Analyse your meeting and transcribe issues directly from them with DevVox AI.
            <br />
            Max Audio file size limit: 50Mb
          </p>
          <div className="mt-3">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting Audio
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div className=''>
          <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
            buildStyles({
              pathColor: `#333333`,
              textColor: `#333333`
            })
          } />
          <p className=' text-sm text-gray-500 text-center'>Uploading....</p>
        </div>
      )}
    </Card>
  )
}

export default MeetingCard
