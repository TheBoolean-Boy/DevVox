"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type formInput = {
  repoUrl: string,
  projectName: string,
  githubToken?: string
}

const CreatePage = () => {

  const {register, handleSubmit, reset} = useForm<formInput>()
  const createProject =  api.project.createProject.useMutation()
  const refetch = useRefetch()

  const onSubmit = (data: formInput) => {
    // alert(JSON.stringify(data, null, 2))
    createProject.mutate({
      githubUrl: data.repoUrl,
      name: data.projectName,
      githubToken: data.githubToken
    }, {
      onSuccess: () => {
        toast.success("Project created successfully")
        refetch()
        reset()
      },
      onError: () => {
        toast.error("Failed to create project")
      }
    })
    return true
  }
  return (
    <div className='flex items-center justify-center gap-12 h-full'>
      <img src="/undraw_programming.svg" alt="programming icon" className='h-56 w-auto'/>
      <div>
        <div>
          <h1 className=' text-2xl font-semibold'>
            Add your Github Repository
          </h1>
          <p className=' text-sm text-muted-foreground'>
            Enter the link to your repo in DevVox
          </p>
        </div>
        <div className='h-4'></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input required
            {...register('projectName', {required: true})}
            placeholder='ProjectName'/>
            <div className='h-2'></div>

            <Input required
            type='url'
            {...register('repoUrl', {required: true})}
            placeholder='Link to your gitub repo'/>
            <div className='h-2'></div>

            <Input 
            {...register('githubToken', )}
            placeholder='Your Github Token(optional)'/>
            <div className='h-4'></div>

            <Button disabled={createProject.isPending} type='submit' className=' hover:bg-black hover:scale-105 hover:font-bold cursor-pointer'>
              Create Project
              </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
