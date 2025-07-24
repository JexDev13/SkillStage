import React from 'react';
import { Check, X } from 'lucide-react';

interface MultipleChoiceGameProps {
    question: {
        question: string;
        options: string[];
        userAnswer?: string;
        answer: string;
        isChecked: boolean;
    };
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}

const MultipleChoiceGame: React.FC<MultipleChoiceGameProps> = ({
    question,
    onAnswer,
    disabled = false,
}) => {
    return (
        <div className="space-y-6">

            <div className="mb-2">
                <h2 className="text-base font-semibold text-[#1ea5b9]">
                    Complete the sentence with the correct option:
                </h2>
            </div>

            {question.question && (
                <p className="text-lg text-gray-800 leading-relaxed">
                    {question.question}
                </p>
            )}

            <div className="space-y-3">
                {question.options.map((opt, idx) => {
                    const isSelected = question.userAnswer === opt;
                    const isCorrect = opt === question.answer;
                    const show = question.isChecked;

                    let className =
                        'w-full p-4 text-left border-2 rounded-lg transition-all flex items-center justify-between';

                    if (show) {
                        if (isCorrect) {
                            className += ' border-green-500 bg-green-50 text-green-800';
                        } else if (isSelected && !isCorrect) {
                            className += ' border-red-500 bg-red-50 text-red-800';
                        } else {
                            className += ' border-gray-200 bg-gray-50 text-gray-600';
                        }
                    } else if (isSelected) {
                        className += ' border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]';
                    } else {
                        className +=
                            ' border-gray-200 hover:border-[#1ea5b9]/50 hover:bg-[#1ea5b9]/5';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => onAnswer(opt)}
                            disabled={disabled}
                            className={className}
                        >
                            <span>{opt}</span>
                            {show && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                            {show && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MultipleChoiceGame;
