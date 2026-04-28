import { TaigaUserStory } from '@/types/taiga'
import { DateRange } from '@/components/ui/DateRangePicker'

export function filterStoriesByDateRange(
  stories: TaigaUserStory[],
  range: DateRange
): TaigaUserStory[] {
  // Kalau "Semua waktu" → return semua
  if (!range.start || !range.end) return stories

  const start = new Date(range.start).setHours(0, 0, 0, 0)
  const end = new Date(range.end).setHours(23, 59, 59, 999)

  return stories.filter(story => {
    // Story yang sudah done → filter berdasarkan finish_date
    if (story.is_closed && story.finish_date) {
      const finished = new Date(story.finish_date).getTime()
      return finished >= start && finished <= end
    }

    // Story yang ongoing → tampilkan kalau due_date dalam range
    // ATAU due_date null tapi created dalam range
    if (!story.is_closed) {
      if (story.due_date) {
        const due = new Date(story.due_date).getTime()
        return due >= start && due <= end
      }
      // Fallback: filter by modified_date untuk ongoing tanpa due_date
      const modified = new Date((story as any).modified_date).getTime()
      return modified >= start && modified <= end
    }

    return false
  })
}