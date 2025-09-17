"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React, { useState } from 'react'
import { askQuestion } from './action'
import { readStreamableValue } from '@ai-sdk/rsc'

const AskQuestionCard = () => {
  const { project } = useProject()
  const [question, setQuestion] = useState('')
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fileReferences, setFileReferences] = React.useState<{fileName: string, sourceCode: string, summary: string}[]>([])
  const [answer, setAnswer] = React.useState('')
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!project?.id)return
    setLoading(true)
    setOpen(true)

    const {output, fileReferences} = await askQuestion(question, project.id)
    setFileReferences(fileReferences)


    for await(const delta of readStreamableValue(output)){
      if(delta){
        setAnswer(ans => ans + delta)
      }
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src='/logo.png' alt='DevVox' width={40} height={40} />
            </DialogTitle>
          </DialogHeader>
          {answer}
          {
            fileReferences.map((file, index) => {
              return <span key={index}>{file.fileName}</span>
            })
          }
        </DialogContent>
      </Dialog>

      <Card className='relative col-span-3'>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder='Which file should I edit to change the home page?'
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className='h-4'></div>
            <Button type='submit'>
              Ask DevVox!
            </Button>
          </form>
        </CardContent>
      </Card>

    </>
  )
}

export default AskQuestionCard
