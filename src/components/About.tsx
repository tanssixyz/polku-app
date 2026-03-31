import { useState } from "react"

export function About() {
  const [open, setOpen] = useState(true)

  return (
    <div className="about">
      <button
        className="about-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        what is polku{open ? " ↑" : " ↓"}
      </button>

      {open && (
        <div className="about-body">
          <p>
            You enter an unmapped forest.
            Something asks you a question.
          </p>
          <p>
            Not to test you. Not to guide you.
            To find where you actually are —
            beneath the habit of answering.
          </p>
          <p>
            When you arrive somewhere real,
            the walk ends. You carry one thing out.
            That one thing is written to Base
            and witnessed permanently.
          </p>
          <p>
            The exchange disappears.
            What you carried does not.
          </p>
          <p className="about-etymology">
            from Finnish — <em>polku</em>, a path made by walking,
            not planned in advance
          </p>
        </div>
      )}
    </div>
  )
}
