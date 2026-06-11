import { useDragScroll } from '@/hooks/useDragScroll'
import { Button } from '../../ui/button';

interface IProps {
    cards: { id: number; nome: string }[]
    activeCategory: number | null
    onSelect: (id: number | null) => void
}

export function DragScrollContainer({ cards, activeCategory, onSelect }: IProps) {
  const drag = useDragScroll()

  function handleSelect(id: number | null) {
    onSelect(id)
    if (id === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(`categoria-${id}`)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={drag.ref}
      onMouseDown={drag.onMouseDown}
      onMouseLeave={drag.onMouseLeave}
      onMouseUp={drag.onMouseUp}
      onMouseMove={drag.onMouseMove}
      className="flex gap-2 overflow-x-auto scrollbar-hide select-none cursor-grab pb-1"
      style={{ scrollBehavior: 'auto' }}
    >
      <Button
        key="todas"
        variant={activeCategory === null ? 'default' : 'outline'}
        size="sm"
        className="shrink-0"
        onClick={() => handleSelect(null)}
      >
        Todas
      </Button>
      {cards.map(card => (
        <Button
          key={card.id}
          variant={activeCategory === card.id ? 'default' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => handleSelect(card.id)}
        >
          {card.nome}
        </Button>
      ))}
    </div>
  )
}
