import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { HelpCircle, Book, GamepadIcon, Trophy } from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ open, onOpenChange }) => {
  const faqs = [
    {
      id: 'getting-started',
      question: 'How do I get started with the platform?',
      answer: 'After logging in, you\'ll see the main dashboard with Grammar and Exercises sections. Start with Grammar to learn theory, then practice with Exercises. Units unlock progressively as you complete them.'
    },
    {
      id: 'grammar-section',
      question: 'How does the Grammar section work?',
      answer: 'The Grammar section is organized by units. Click on a unit to see available topics, then select a topic to view detailed explanations, rules, and examples. You can navigate back and forth between topics freely.'
    },
    {
      id: 'exercises',
      question: 'How do exercises work?',
      answer: 'Exercises are interactive quizzes grouped by units. Each exercise shows instructions before you start. Answer questions, check your answers for immediate feedback, and navigate through questions. You must check all answers before completing an exercise.'
    },
    {
      id: 'scoring',
      question: 'How is my progress tracked?',
      answer: 'Your progress is automatically saved. Exercise scores show your percentage and are stored in your profile. You can retake exercises to improve your scores. Completed units unlock new content.'
    },
    {
      id: 'navigation',
      question: 'How do I navigate the platform?',
      answer: 'Use the sidebar buttons to switch between sections: Home (overview), Grammar (theory), and Exercises (practice). The orange help button opens this help dialog, and the purple settings button controls audio preferences.'
    }
  ];

  const tips = [
    {
      icon: Book,
      title: 'Study Grammar First',
      description: 'Review grammar topics before attempting related exercises for better understanding.'
    },
    {
      icon: GamepadIcon,
      title: 'Practice Regularly',
      description: 'Consistent practice with exercises helps reinforce what you\'ve learned.'
    },
    {
      icon: Trophy,
      title: 'Review Mistakes',
      description: 'Pay attention to explanations when you get answers wrong - they help you learn.'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-[#ff852e]">
            <HelpCircle className="h-6 w-6" />
            <span>Help & Support</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Quick Tips */}
          <div>
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Quick Tips</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <Icon className="h-8 w-8 text-[#ff852e] mb-2" />
                    <h4 className="font-medium text-[#1ea5b9] mb-2">{tip.title}</h4>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium text-[#1ea5b9]">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Info */}
          <div className="p-4 bg-[#1ea5b9]/10 rounded-lg">
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-2">Need More Help?</h3>
            <p className="text-gray-700">
              If you have questions not covered here, feel free to reach out to our support team. 
              We're here to help you succeed in your English learning journey!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};