"use client"

import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React, { useState } from 'react'
import { askQuestion } from './action'
import { readStreamableValue } from '@ai-sdk/rsc'
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const AskQuestionCard = () => {
  const { project } = useProject()
  const [question, setQuestion] = useState('')
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fileReferences, setFileReferences] = React.useState<{ fileName: string, sourceCode: string, summary: string }[]>([])
  const [answer, setAnswer] = React.useState('')
  const saveAnswer = api.project.saveAnswer.useMutation()

  const refetch = useRefetch()

  const onSaveAnswer = async () => {
    saveAnswer.mutate({
      projectId: project!.id,
      question,
      answer,
      fileReferences
    }, 
    {
      onSuccess: () => {
        toast.success("Answer saved successfully")
        refetch()
      },
      onError: () => {
        toast.error("Couldn't save the answer")
      }
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer('')
    setFileReferences([])
    e.preventDefault()
    if (!project?.id) return
    setLoading(true)

    const { output, fileReferences } = await askQuestion(question, project.id)
    setOpen(true)
    setFileReferences(fileReferences)

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer(ans => ans + delta)
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[95vw] max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <div className='flex items-center gap-2 justify-between'>
              <DialogTitle className='flex items-center gap-2'>
                <Image src='/logo.png' alt='DevVox' width={40} height={40} />
                <span>DevVox Answer</span>
              </DialogTitle>
              <div className='flex gap-2'>
                <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={onSaveAnswer}>
                  Save Answer
                </Button>
                <Button type='button' variant={'outline'} onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className='flex gap-4 flex-1 min-h-0'>
            <div className='flex-1 flex flex-col min-w-0'>
              <h3 className='text-lg font-semibold mb-2 text-gray-700'>Answer to your query</h3>
              <div className='flex-1 border rounded-lg overflow-hidden'>
                <MDEditor.Markdown 
                  source={answer || 'Waiting for response...'} 
                  className='px-4 py-3 h-full overflow-auto rounded-lg' 
                  data-color-mode="light" 
                />
              </div>
            </div>

            {fileReferences.length > 0 && (
              <div className='flex-1 flex flex-col min-w-0'>
                <h3 className='text-lg font-semibold mb-2 text-gray-700'>Files referred from Codebase</h3>
                <div className='flex-1 min-h-0'>
                  <CodeReferences filesReferences={fileReferences} />
                </div>
              </div>
            )}
          </div>
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
            <Button type='submit' disabled={loading}>
              {loading ? 'Processing...' : 'Ask DevVox!'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard