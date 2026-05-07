import { TaigaUserStory } from '@/types/taiga'
import { DateRange } from '@/components/ui/DateRangePicker'

export function filterStoriesByDateRange(
  stories: TaigaUserStory[],
  range: DateRange
): TaigaUserStory[] {
  if (!range.start || !range.end) return stories

  const start = new Date(range.start).setHours(0, 0, 0, 0)
  const end   = new Date(range.end).setHours(23, 59, 59, 999)

  return stories.filter(story => {
    const modifiedDate  = new Date((story as any).modified_date || 0).getTime()
    const finishDate    = story.finish_date ? new Date(story.finish_date).getTime() : null
    const dueDate       = story.due_date ? new Date(story.due_date).getTime() : null
    const createdDate   = new Date((story as any).created_date || 0).getTime()

    if (story.is_closed) {
      // Cek finish_date dulu, fallback ke modified_date
      const closedAt = finishDate ?? modifiedDate
      return closedAt >= start && closedAt <= end
    }

    // Ongoing — cek due_date, modified_date, atau created_date
    if (dueDate) return dueDate >= start && dueDate <= end
    if (modifiedDate >= start && modifiedDate <= end) return true
    return createdDate >= start && createdDate <= end
  })
}