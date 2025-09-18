"use client"

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import { materialDark, atomDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import React from 'react'

type Props = {
  filesReferences: { fileName: string; sourceCode: string, summary: string }[]
}

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = React.useState(filesReferences[0]?.fileName)
  
  if(filesReferences.length === 0) return null

  return (
    <div className='h-full flex flex-col'>
      <Tabs value={tab} onValueChange={setTab} className='flex flex-col h-full'>
        {/* Tab headers */}
        <div className='flex-shrink-0 overflow-x-auto'>
          <div className='flex gap-1 bg-gray-200 p-1 rounded-md min-w-max'>
            {filesReferences.map((file, index) => (
              <button 
                onClick={() => setTab(file.fileName)} 
                key={index} 
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted',
                  {
                    'bg-primary text-primary-foreground': tab === file.fileName,
                  }
                )}
              >
                {file.fileName}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className='flex-1 mt-2 min-h-0'>
          {filesReferences.map((file) => (
            <TabsContent 
              key={file.fileName} 
              value={file.fileName}  
              className='h-full m-0 border rounded-md overflow-hidden'
            >
              <div className='h-full overflow-auto'>
                <SyntaxHighlighter 
                  language='typescript' 
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    height: '100%',
                    borderRadius: '0.375rem'
                  }}
                >
                  {file.sourceCode}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

export default CodeReferences