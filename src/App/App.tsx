import * as React from "react";

import api from "../question/api";
import QuestionCard from "../question/components/QuestionCard";
import {Question} from "../question/types";
import Button from "../ui/controls/Button";

import styles from "./App.module.scss";

const App: React.FC = () => {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<number>(0);
  const [points, setPoints] = React.useState<number>(0);
  const [status, setStatus] = React.useState<"pending" | "resolved" | "finished">("pending");
  const [isAnswered, setIsAnswered] = React.useState<boolean>(false);
  const [alertText, setAlertText] = React.useState<string>();
  const question = questions[currentQuestion];

  function onAnswer(text: string) {
    setIsAnswered(true);
    if (question.correct_answer === text) {
      setAlertText("Correct!");
    } else {
      setAlertText("Incorrect.");
    }

    setTimeout(() => {
      if (question.correct_answer === text) {
        switch (question.type) {
          case "boolean": {
            setPoints((points) => points + 5);
            break;
          }
          case "multiple": {
            setPoints((points) => points + 10);
            break;
          }
        }
      }

      if (currentQuestion + 1 === questions.length) {
        setStatus("finished");
      } else {
        setCurrentQuestion((current) => current + 1);
      }

      setIsAnswered(false);
    }, 1500);
  }

  function startAgain() {
    setCurrentQuestion(0);
    setPoints(0);
    setStatus("pending");
    getQuestions();
  }

  React.useEffect(() => getQuestions(), []);
  function getQuestions() {
    api.list().then((questions) => {
      setQuestions(questions);
      setStatus("resolved");
    });
  }

  if (status === "pending") {
    return (
      <main className={styles.container}>
        <div>Loading...</div>
      </main>
    );
  }

  if (status === "finished") {
    return (
      <main className={styles.container}>
        <div>You earned {points} points!</div>
        <Button onClick={() => startAgain()}>Start again</Button>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <QuestionCard
        footer={`${question.category} | ${question.difficulty}`}
        header={`${currentQuestion + 1} / ${questions.length}`}
      >
        {question.question.replace(/&quot;/g, '"').replace(/&#039;/g, `'`)}
      </QuestionCard>

      <nav className={styles.answers}>
        {[...question.incorrect_answers, question.correct_answer]
          .sort((a, b) => a.localeCompare(b))
          .map((answer) => (
            <Button key={answer} disabled={isAnswered && true} onClick={() => onAnswer(answer)}>
              {answer}
            </Button>
          ))}
        <div className={`${styles.alert} ${isAnswered && styles.visible}`}>
          <div>{alertText}</div>
        </div>
      </nav>
    </main>
  );
};

export default App;
