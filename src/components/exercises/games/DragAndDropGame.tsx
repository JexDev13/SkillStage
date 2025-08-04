import React, { useEffect, useState, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    UniqueIdentifier,
    useDroppable,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, X } from 'lucide-react';

interface DragAndDropGameProps {
    question: {
        question: string;
        game_id: string;
        blanks: { correct_answer: string }[];
        answer: string;
        draggable_options: string[];
        userAnswer?: string;
        isChecked: boolean;
    };
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}

interface OptionItem {
    id: string;
    text: string;
}

interface SortableItemProps {
    id: string;
    text: string;
    disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, text, disabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        disabled,
        data: {
            from: 'options',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0 : (disabled ? 0.5 : 1),
        padding: '8px 12px',
        borderRadius: 4,
        boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.2)' : undefined,
        backgroundColor: isDragging ? '#bfdbfe' : 'white',
        border: '1px solid #ccc',
        userSelect: 'none' as React.CSSProperties['userSelect'],
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#333',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {text}
        </div>
    );
};

interface BlankSlotProps {
    id: string;
    assignedOption?: OptionItem;
    onRemove: () => void;
    isActive: boolean;
    status: 'correct' | 'incorrect' | 'neutral';
    disabled?: boolean;
}

const BlankSlot: React.FC<BlankSlotProps> = ({ id, assignedOption, onRemove, isActive, status, disabled }) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            from: 'blank',
        },
    });

    let borderColor = '#9ca3af';
    let backgroundColor = 'transparent';

    if (status === 'correct') {
        borderColor = '#22c55e';
        backgroundColor = '#dcfce7';
    } else if (status === 'incorrect') {
        borderColor = '#ef4444';
        backgroundColor = '#fee2e2';
    } else if (isOver) {
        backgroundColor = '#bfdbfe';
    } else if (isActive) {
        backgroundColor = '#dbeafe';
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (assignedOption && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onRemove();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                minWidth: 100,
                minHeight: 40,
                border: `2px dashed ${borderColor}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                backgroundColor,
                cursor: assignedOption ? 'pointer' : 'default',
                userSelect: 'none',
                transition: 'background-color 0.2s',
            }}
            onClick={() => {
                if (assignedOption && !disabled) onRemove();
            }}
            onKeyDown={handleKeyDown}
            tabIndex={assignedOption && !disabled ? 0 : -1}
            role="button"
            aria-label={
                assignedOption
                    ? `Placed option: ${assignedOption.text}. Press Enter or Space to remove.`
                    : 'Empty blank slot'
            }
            title={assignedOption ? 'Click or press Enter/Space to remove' : undefined}
        >
            {assignedOption ? (
                <span style={{ color: '#111' }}>{assignedOption.text}</span>
            ) : (
                <span style={{ color: '#9ca3af' }}>(Drop here)</span>
            )}
        </div>
    );
};

const DragAndDropGame: React.FC<DragAndDropGameProps> = ({
    question,
    onAnswer,
    disabled = false,
}) => {
    const [options, setOptions] = useState<OptionItem[]>([]);
    const [assigned, setAssigned] = useState<(OptionItem | null)[]>([]);
    const previousGameIdRef = useRef<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const optionsContainerRef = useRef<HTMLDivElement>(null);

    const handleOptionsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (activeId) return;

        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
            return;
        }

        e.preventDefault();

        const items = Array.from(
            optionsContainerRef.current?.querySelectorAll<HTMLElement>('[role="button"]') ?? []
        );

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = items.findIndex(item => item === activeElement);

        if (currentIndex === -1) {
            items[0]?.focus();
            return;
        }

        let nextIndex;
        if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % items.length;
        } else { // ArrowLeft
            nextIndex = (currentIndex - 1 + items.length) % items.length;
        }

        items[nextIndex]?.focus();
    };

    useEffect(() => {
        if (previousGameIdRef.current !== question.game_id) {
            const newOptions = question.draggable_options.map((word, index) => ({
                id: `opt-${question.game_id}-${index}-${word}`,
                text: word,
            }));

            if (question.userAnswer && question.userAnswer.trim() !== '') {
                const answerWords = question.userAnswer.split(' ');
                const newAssigned = answerWords.map((word) => {
                    const option = newOptions.find((o) => o.text === word);
                    if (option) {
                        return option;
                    }
                    return null;
                });

                const assignedIds = newAssigned.filter(Boolean).map(o => o!.id);
                const filteredOptions = newOptions.filter(o => !assignedIds.includes(o.id));

                setOptions(filteredOptions);
                setAssigned(newAssigned);
            } else {
                setOptions(newOptions);
                const blankCount = (question.question.match(/___/g) || []).length;
                setAssigned(Array(blankCount).fill(null));
            }
            previousGameIdRef.current = question.game_id;
        }
    }, [question]);


    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
    const isCorrect = question.isChecked
        ? assigned.every(
            (opt, i) => opt?.text === question.blanks[i]?.correct_answer
        )
        : undefined;

    const handleDragEnd = (event: DragEndEvent) => {
        if (question.isChecked) return;
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        if (active.data.current?.from === 'options' && over.data.current?.from === 'options') {
            if (active.id !== over.id) {
                const oldIndex = options.findIndex((o) => o.id === active.id);
                const newIndex = options.findIndex((o) => o.id === over.id);
                setOptions(arrayMove(options, oldIndex, newIndex));
            }
            return;
        }

        if (over.data.current?.from === 'blank') {
            const blankIndex = parseInt(String(over.id).replace('blank-', ''), 10);
            const draggedOption = options.find((o) => o.id === active.id);
            if (!draggedOption) return;

            const currentAssigned = assigned[blankIndex];
            let newOptions = options.filter((o) => o.id !== active.id);
            if (currentAssigned) newOptions = [...newOptions, currentAssigned];

            const newAssigned = [...assigned];
            newAssigned[blankIndex] = draggedOption;
            setAssigned(newAssigned);
            setOptions(newOptions);

            onAnswer(newAssigned.map((opt) => (opt ? opt.text : '')).join(' ').trim());
            return;
        }

        if (over.data.current?.from === 'options' && active.data.current?.from === 'blank') {
            const blankIndex = parseInt(String(active.id).replace('blank-', ''), 10);
            const assignedOption = assigned[blankIndex];
            if (!assignedOption) return;

            const newAssigned = [...assigned];
            newAssigned[blankIndex] = null;
            setAssigned(newAssigned);
            setOptions([...options, assignedOption]);

            onAnswer(newAssigned.map((opt) => (opt ? opt.text : '')).join(' ').trim());
            return;
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (question.isChecked) return;
        const activeIdRaw: UniqueIdentifier = event.active.id;
        setActiveId(typeof activeIdRaw === 'string' ? activeIdRaw : String(activeIdRaw));
    };

    let blankIndex = 0;

    const partsRendered = question.question.split(/(___)/g).map((part, idx) => {
        if (part === '___') {
            const currentBlankIndex = blankIndex++;
            const assignedOption = assigned[currentBlankIndex];
            const correctWord = question.blanks[currentBlankIndex]?.correct_answer ?? '';
            const userWord = assignedOption?.text ?? '';

            let status: 'correct' | 'incorrect' | 'neutral' = 'neutral';
            if (question.isChecked) {
                status = userWord === correctWord ? 'correct' : 'incorrect';
            }

            return (
                <BlankSlot
                    key={`blank-${currentBlankIndex}`}
                    id={`blank-${currentBlankIndex}`}
                    assignedOption={assignedOption ?? undefined}
                    onRemove={() => {
                        if (!assignedOption) return;
                        const newAssigned = [...assigned];
                        newAssigned[currentBlankIndex] = null;
                        setAssigned(newAssigned);
                        setOptions((prev) => [...prev, assignedOption]);
                        onAnswer(newAssigned.map((opt) => (opt ? opt.text : '')).join(' ').trim());
                    }}
                    isActive={activeId !== null && activeId.startsWith('opt-')}
                    status={status}
                    disabled={question.isChecked}
                />
            );
        } else {
            return <span key={`text-${idx}`}>{part}</span>;
        }
    });

    return (
        <div className="space-y-6 border rounded-lg shadow p-6 bg-white">
            <h2 className="text-base font-semibold text-[#1ea5b9] flex items-center gap-2">
                Drag the options to the correct blanks:
            </h2>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="text-lg text-gray-800 leading-relaxed flex flex-wrap items-center gap-2 mb-4">
                    {partsRendered}
                    {question.isChecked &&
                        (isCorrect ? (
                            <Check className="text-green-500 w-5 h-5" />
                        ) : (
                            <X className="text-red-500 w-5 h-5" />
                        ))}
                </div>

                <h3 className="text-sm font-medium text-gray-600 mb-2">Options:</h3>

                <SortableContext
                    items={options.map((o) => o.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div 
                        ref={optionsContainerRef} 
                        onKeyDown={handleOptionsKeyDown}
                        className="flex flex-wrap gap-3 p-4 border rounded bg-gray-50 min-h-[60px]"
                    >
                        {options.map((option) => (
                            <SortableItem
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                disabled={disabled}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        <div
                            style={{
                                padding: '8px 12px',
                                borderRadius: 4,
                                backgroundColor: '#bfdbfe',
                                border: '1px solid #93c5fd',
                                fontWeight: 600,
                                color: '#111',
                                userSelect: 'none',
                            }}
                        >
                            {options.find((o) => o.id === activeId)?.text ??
                                assigned.find((a) => a?.id === activeId)?.text}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default DragAndDropGame;
