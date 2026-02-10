export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  keyContentSignals: string[];
}

export const questions: InterviewQuestion[] = [
  {
    id: "1",
    category: "Adaptability in the face of multiple changes",
    question:
      "Please recall a time you were faced with multiple changes or different requests throughout a shift that required you to adjust what you were doing. Share with us the situation, the action that you took, and the outcome. How did you feel about the constant change?",
    situation:
      "One busy Friday evening, two of my colleagues called in sick, and we suddenly had a large group of 20 people arrive without a reservation.",
    task: "I needed to look after my own tables while also helping the new group and making sure the kitchen wasn't overwhelmed.",
    action:
      "I stayed calm and prioritized my tasks. I checked all my tables in one go to save time and communicated directly with the kitchen because the ticket printer was slow. I also updated the guests about the slightly longer wait times.",
    result:
      "We managed to serve everyone successfully without any complaints. I felt focused and proud that I could adjust quickly to the pressure.",
    keyContentSignals: ["change", "adjust", "prioritize", "communication", "multitask"],
  },
  {
    id: "2",
    category: "Customer handling using empathy",
    question:
      "Tell us about a situation where you effectively handled a dissatisfied customer using compassion and empathy. Please describe the situation, your actions, and the outcome.",
    situation:
      "A customer was very angry because their steak was served cold after they had waited for 45 minutes.",
    task: "My goal was to de-escalate the tension and make sure the customer felt heard and respected.",
    action:
      "I listened to them without interrupting and used empathetic language, saying I understood why they were frustrated. I apologized sincerely, offered a fresh meal immediately, and gave them a free drink while they waited.",
    result:
      "The customer's attitude changed completely. They thanked me for being so understanding and even left a positive review.",
    keyContentSignals: ["empathy", "listen", "understand", "de-escalate", "valued"],
  },
  {
    id: "3",
    category: "Ethical awareness regarding rule violations",
    question:
      "Please give an example of a time you witnessed someone you work with acting against established rules, policies, procedures, or safety protocols. What actions did you take, and what were the results?",
    situation:
      "I noticed a new staff member using the same cloth to clean a floor spill and then a dining table, which is against our hygiene protocols.",
    task: "I had to stop the safety risk immediately without making my colleague feel embarrassed in front of customers.",
    action:
      "I pulled them aside for a private chat and explained why using separate cloths is vital for food safety. I then showed them where the color-coded cloths were kept and helped them re-sanitize the table.",
    result:
      "We avoided a health hazard, and my colleague thanked me for helping them learn the correct procedure.",
    keyContentSignals: ["safety", "protocol", "intervene", "correct", "prevent"],
  },
  {
    id: "4",
    category: "Customer satisfaction management and service recovery",
    question:
      "Great service is about ensuring customer satisfaction. Describe a time you turned an unsatisfied customer into a satisfied customer. Please describe the situation, your actions, and the outcome.",
    situation:
      "A couple came in for their anniversary, but their reserved table was accidentally given to someone else, so they were seated in a noisy area.",
    task: "I wanted to save their special evening and make up for the mistake.",
    action:
      "I apologized for the error and brought them two glasses of complimentary champagne. I kept a close eye on their service and, as soon as a quiet table became available, I moved them there for their main course.",
    result:
      "They were very happy with the personal attention. By the end of the night, they told me that the service made their anniversary feel even more special.",
    keyContentSignals: ["apologize", "solution", "monitor", "satisfaction", "special"],
  },
  {
    id: "5",
    category: "Resilience when overwhelmed by challenges",
    question:
      "Tell us about a time you struggled with, or were overwhelmed by, a new or difficult challenge at work. Please describe the situation, your actions, and the outcome.",
    situation:
      "I was promoted to a senior role and had to learn how to do the financial closing reports, which I found very confusing at first.",
    task: "I had to complete the reports accurately by the end of my shift.",
    action:
      "I felt a bit overwhelmed, so I took the initiative to arrive early for my shifts to study the manual. I also asked my manager if I could shadow them once to see the process in action and created a simple checklist for myself.",
    result:
      "After a few days, I could complete the reports quickly and without any errors. It taught me that asking for help is an effective way to handle new challenges.",
    keyContentSignals: ["overwhelmed", "initiative", "learn", "practice", "improve"],
  },
  {
    id: "6",
    category: "Ethical awareness and personal integrity",
    question:
      "Doing the right thing is not always easy. Tell us about a time when you chose what you thought was the most ethical course of action even though there were other easier options. Please describe the situation, your actions, and the outcome.",
    situation:
      "I found an expensive watch at a table after a group left. A coworker suggested we just leave it in the lost and found drawer, which was rarely checked.",
    task: "I believed the most ethical action was to try and contact the owner immediately.",
    action:
      "I ignored the easier option and checked the booking system to find the customer's name and phone number. I called them right away to let them know we had found their watch.",
    result:
      "The customer returned 10 minutes later and was extremely relieved. This helped maintain our restaurant's reputation for honesty and integrity.",
    keyContentSignals: ["ethical", "secure", "responsibility", "trust", "integrity"],
  },
];
