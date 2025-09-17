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
// import { materialDark, atomDark, holiTheme} from 'react-syntax-highlighter/dist/esm/styles/prism'


const AskQuestionCard = () => {
  const { project } = useProject()
  const [question, setQuestion] = useState('')
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fileReferences, setFileReferences] = React.useState<{ fileName: string, sourceCode: string, summary: string }[]>([])
  const [answer, setAnswer] = React.useState('')
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
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=' sm:max-w-[70vw]'>
          <DialogHeader>
            <DialogTitle>
              <Image src='/logo.png' alt='DevVox' width={40} height={40} />
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown source={answer} className=' px-4 py-3 max-w-[70vw] !h-full max-h-[40vh] overflow-scroll rounded-2xl ' data-color-mode="light" />

          <div className=' h-4'></div>
          <CodeReferences filesReferences={fileReferences}/>
          <Button type='button' onClick={() => { setOpen(false) }}>
            Close
          </Button>


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
              Ask DevVox!
            </Button>
          </form>
        </CardContent>
      </Card>

    </>
  )
}

export default AskQuestionCard
