"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import { Info } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type formInput = {
  repoUrl: string,
  projectName: string,
  githubToken?: string
}

const CreatePage = () => {

  const { register, handleSubmit, reset } = useForm<formInput>()
  const createProject = api.project.createProject.useMutation()
  const checkCredits = api.project.checkCredits.useMutation()
  const refetch = useRefetch()

  const onSubmit = (data: formInput) => {

    if (!!checkCredits.data) {
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
    } else{
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken
      })
    }

  }
  const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true
  return (
    <div className='flex items-center justify-center gap-12 h-full'>
      <img src="/undraw_programming.svg" alt="programming icon" className='h-56 w-auto' />
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
              {...register('projectName', { required: true })}
              placeholder='ProjectName' />
            <div className='h-2'></div>

            <Input required
              type='url'
              {...register('repoUrl', { required: true })}
              placeholder='Link to your gitub repo' />
            <div className='h-2'></div>

            <Input
              {...register('githubToken',)}
              placeholder='Your Github Token(optional)' />
            <div className='h-4'></div>

            {!!checkCredits.data && (
              <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                <div className="flex items-center gap-2">
                  <Info className='size-4' />
                  <p className='text-sm'>You will be charged <strong>{checkCredits.data?.fileCount}</strong> credits for this repository.</p>
                </div>
                <p className='text-sm text-gray-600 ml-6'>You have <strong>{checkCredits.data?.userCredits}</strong> credits in your account. </p>
              </div>
            )}

            <Button disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits} type='submit' className=' hover:bg-black hover:scale-105 hover:font-bold cursor-pointer mt-3'>
              {/* { !!checkCredits.data ? 'Create Project' || 'Check Credits'}
               */}
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
