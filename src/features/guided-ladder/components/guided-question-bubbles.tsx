import { Button } from '@/components/ui/button'

export type GuidedQuestion = {
  id: string
  label: string
  topicId: string
}

type GuidedQuestionBubblesProps = {
  questions: GuidedQuestion[]
  onSelect: (topicId: string) => void
}

export function GuidedQuestionBubbles({
  questions,
  onSelect,
}: GuidedQuestionBubblesProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {questions.map((question) => (
        <Button
          key={question.id}
          variant="secondary"
          className="max-w-full justify-start whitespace-normal px-4 py-3 text-left text-sm leading-6"
          onClick={() => onSelect(question.topicId)}
        >
          {question.label}
        </Button>
      ))}
    </div>
  )
}
