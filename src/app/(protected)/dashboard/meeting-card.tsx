"use client"
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'

const MeetingCard = () => {
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
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
      const downloadUrl = await uploadFile(file as File, setProgress)
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
            Analyse your meeting with Dionysus.
            <br />
            Powered by AI.
          </p>
          <div className="mt-3">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
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
          }/>
          <p className=' text-sm text-gray-500 text-center'>Uploading....</p>
        </div>
      )}
    </Card>
  )
}

export default MeetingCard
