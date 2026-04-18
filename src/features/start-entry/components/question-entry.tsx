import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const questionEntrySchema = z.object({
  question: z
    .string()
    .trim()
    .min(4, 'A question needs at least a little more shape.'),
})

type QuestionEntryValues = z.infer<typeof questionEntrySchema>

type QuestionEntryProps = {
  onSubmit: (question: string) => void
  onAttachSource?: () => void
}

export function QuestionEntry({ onSubmit, onAttachSource }: QuestionEntryProps) {
  const form = useForm<QuestionEntryValues>({
    resolver: zodResolver(questionEntrySchema),
    defaultValues: {
      question: '',
    },
  })

  const handleSubmit = form.handleSubmit(({ question }) => onSubmit(question))

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        className="h-16 w-full min-w-0 sm:w-[36rem]"
        placeholder="Ask a question, follow a curiosity, or begin with a why..."
        {...form.register('question')}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="submit" variant="ghost">
            Start Learning
          </Button>
          {onAttachSource ? (
            <Button type="button" variant="ghost" onClick={onAttachSource}>
              Attach a source
            </Button>
          ) : null}
        </div>

        <p className="min-h-5 text-center text-sm text-rose-200/70">
          {form.formState.errors.question?.message ?? ''}
        </p>
      </div>
    </form>
  )
}
