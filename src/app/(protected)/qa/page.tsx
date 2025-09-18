"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'

const QAPage = () => {
  const { projectId } = useProject()
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })

  const [questionIndex, setQuestionIndex] = React.useState(0)
  const question = questions?.[questionIndex]
  
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                <img className="rounded-full" height={30} width={30} src={question.user.imageUrl ?? ""} />
                <div className="text-left flex flex-col">
                  <div className='flex items-center gap-2'>
                    <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                      {question.question}
                    </p>
                    <span className='text-xs text-gray-400 whitespace-nowrap'>
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-gray-500 line-clamp-1 text-sm'>
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>

      {question && (
        <SheetContent className='sm:max-w-[95vw] flex flex-col h-full'>
          <SheetHeader className='flex-shrink-0 px-4 pt-6 pb-2'>
            <SheetTitle className='text-left text-2xl font-bold leading-tight'>
              {question.question}
            </SheetTitle>
          </SheetHeader>
          
          <div className='flex gap-4 flex-1 min-h-0 mt-0 p-4'>
            <div className='flex-1 flex flex-col min-w-0'>
              <h3 className='text-lg font-semibold mb-2 text-gray-700 flex-shrink-0'>Answer</h3>
              <div className='flex-1 border rounded-lg overflow-hidden bg-white'>
                <div className='h-full overflow-auto' data-color-mode="light">
                  <div className='w-full min-h-full bg-white' style={{
                    '--color-canvas-default': 'white',
                    '--color-fg-default': '#374151'
                  } as React.CSSProperties}>
                    <MDEditor.Markdown 
                      source={question.answer} 
                      className='px-4 py-3 min-h-full' 
                      data-color-mode="light"
                      style={{
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {question.fileReferences && (question.fileReferences as any[]).length > 0 && (
              <div className='flex-1 flex flex-col min-w-0'>
                <h3 className='text-lg font-semibold mb-2 text-gray-700 flex-shrink-0'>Code References</h3>
                <div className='flex-1 min-h-0'>
                  <CodeReferences filesReferences={question.fileReferences as any} />
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage