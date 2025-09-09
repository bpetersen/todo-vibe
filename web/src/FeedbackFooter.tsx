import './FeedbackFooter.css';

export default function FeedbackFooter() {
  return (
    <footer
      className="feedback-footer"
      style={{ position: 'fixed', left: 0, bottom: '1rem', width: '100%', zIndex: 1000 }}
    >
      <a
        href="https://github.com/bpetersen/todo-vibe/issues/new"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬 Give Feedback
      </a>
    </footer>
  );
}
