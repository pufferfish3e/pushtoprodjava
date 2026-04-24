# Revised Hackathon Brief

Working title: `[PROJECT_NAME]`

Important note:

- project name is intentionally unset
- permanent design system is intentionally unset
- this document is about product clarity, scope control, and team execution

This is the polished working brief for the hackathon version of the idea.
It keeps the stronger differentiator:

**one meeting -> multiple role-specific operational briefings**

but updates the product flow from manual note pasting to:

**meeting audio -> transcription -> structured meeting state -> role-specific briefings + generated documentation**

This is not just a meeting note tool.
It is a role-aware coordination layer for organizations that also helps secretaries produce formal records faster.

## 1. Executive Summary

Most AI meeting tools generate one transcript, one summary, or one action-item list for everyone.
But organizations do not work that way.

Different roles need different slices of the same meeting:

- the Secretary needs documentation-critical details and ambiguity checks
- the Organising Committee needs clear next actions
- the CC/VCC needs blockers and intervention points
- President / EXCO needs cross-event oversight and risk

Our product turns one meeting into:

- one transcript
- one structured operational record
- multiple role-specific briefings
- visible risk signals across active events
- generated documentation drafts for the secretary workflow

The core idea is simple:

**AI should not just summarize meetings. It should route the right information to the right role and turn the same meeting into usable operational and documentation outputs.**

## 2. The Real Problem

The obvious problem is that useful information is buried in recordings, notes, minutes, PDFs, chats, and spreadsheets.

The deeper problem is:

**organizations create too much shared information, but not enough role-relevant information.**

In SPSU, one meeting can include:

- event updates
- task assignments
- blockers
- budget notes
- advisor comments
- logistics constraints
- next meeting details
- decisions that must appear in formal records

Right now, that all gets flattened into one shared stream of information.

That creates:

- clutter
- poor visibility
- missed signals
- late escalation
- repeated manual checking
- leaders reading things they do not need
- committee members missing the few things they actually need
- secretaries manually rewriting recordings into formal minutes later

This is why the problem is stronger than "meeting notes are annoying."

The real pain is:

**the wrong people are forced to read the wrong level of information, while secretaries still have to turn the meeting into formal documentation by hand.**

## 3. Why This Problem Matters for SPSU

SPSU is a strong setting for this because:

- many events run across the academic year
- several events can overlap at the same time
- leadership and committee roles are clearly distinct
- one person can be assigned across multiple workstreams
- secretaries already record meetings and later produce formal documentation
- documentation exists, but visibility is still weak

That means SPSU does not just have a documentation problem.
It has:

- a documentation workload problem
- an attention-allocation problem
- a visibility problem across overlapping events

The people who need to act cannot easily see what matters to them, and the people responsible for records still spend time reconstructing the meeting into formal output.

## 4. The Differentiated Insight

We do not want to compete head-on with tools like:

- Zoom AI Companion
- Notion AI Meeting Notes
- generic meeting copilots
- generic "chat over your workspace" tools

Those tools are already strong at:

- transcripts
- summaries
- action items
- recap emails
- generic Q&A

Our differentiator is:

**instead of generating one summary for everyone, we generate role-specific operational briefings from the same meeting and produce secretary-usable documentation from the same source.**

This changes the product category from:

- AI meeting notes

to:

- AI-powered attention routing and documentation support for organizational work

That is a much more defensible and memorable perspective.

## 5. The Product Vision

We are building an AI-powered coordination layer for student-run organizations.

A secretary records or uploads meeting audio into the system.
The system transcribes the meeting, then turns that transcript into:

1. a structured operational state for the meeting
2. role-specific briefings for the people involved
3. risk signals that surface what needs attention
4. generated minutes or documentation drafts for the secretary workflow
5. an optional natural-language query layer over the live state

The key outcome is this:

**one messy meeting becomes four clean, role-aware operational briefings plus usable formal documentation.**

## 6. The Agent System

The product works best when explained as a small system of specialized internal agents.

### 1. Transcription Agent

Purpose:

- convert meeting audio into transcript text that the rest of the system can use

Outputs:

- a transcript
- optional speaker-attributed chunks if available

This is the "capture what was said" layer.

### 2. Meeting Agent

Purpose:

- convert transcript text into structured operational state

Outputs:

- tasks
- owners
- deadlines
- blockers
- decisions
- urgency
- possible cross-event conflicts

This is the "what happened" layer.

### 3. Attention Routing Agent

Purpose:

- decide what part of the meeting matters to which role

Outputs:

- Secretary briefing
- Organising Committee briefing
- CC/VCC briefing
- President / EXCO briefing

This is the "who needs to care about what" layer.

This is also the main differentiator.

### 4. Document Agent

Purpose:

- turn the transcript and structured state into secretary-usable documentation

Outputs:

- minutes draft
- summary draft
- structured document sections that can later be exported

This is the "formal record" layer.

Important note:

- this helps adoption because it fits the secretary's real workflow
- it is not the main novelty by itself

### 5. Risk Agent

Purpose:

- surface risk that people may not notice quickly

Examples:

- overloaded person across events
- blocker with no clear owner
- urgent critical-path item close to the event date
- unresolved tasks carried across meetings

This is the "what needs attention now" layer.

### 6. Query Agent

Purpose:

- let people ask plain-English questions over the live operational state

Examples:

- "What changed since the last meeting?"
- "What still blocks Appreciation Dinner?"
- "Who is overloaded this week?"

This is the "how leadership retrieves insight quickly" layer.

Important scope note:

- the Attention Routing Agent is the real novelty
- the Document Agent is the adoption booster
- the Query Agent is useful, but should not become the whole product story

## 7. Role-Specific Briefings

This is the feature that makes the idea feel different.

### Secretary briefing

Goal:

- help the secretary finalize the record correctly

Should show:

- decisions that should appear in official minutes
- tasks with unclear owners or ambiguous wording
- missing deadlines that need clarification
- documentation-relevant follow-ups
- items the system is uncertain about
- generated document-ready content that can be reviewed before finalizing

This is a documentation-focused briefing.

### Organising Committee / OC briefing

Goal:

- help committee members understand what they need to do next

Should show:

- what changed since the last meeting
- what needs action this week
- what is blocked or waiting on someone else
- the most relevant deadlines coming up

This is an action briefing.

### CC/VCC briefing

Goal:

- help event leads know where intervention is needed

Should show:

- blockers
- highest-urgency tasks
- tasks slipping across meetings
- follow-up points requiring direct leadership action
- dependencies that are not moving

This is an intervention briefing.

### President / EXCO briefing

Goal:

- help leadership monitor the organization across events

Should show:

- overloaded people across active events
- which event is most at risk
- major unresolved blockers
- where escalation or oversight is needed

This is an oversight briefing.

## 8. Why This Is More Original

Without this differentiator, the project risks sounding like:

- AI meeting summarizer
- AI task extractor
- AI dashboard
- AI chatbot over a database

Those are useful, but not very differentiated.

With the new framing, the project becomes:

**AI-powered information classification, attention routing, and documentation generation for organizational roles**

That is more original because the system is not just producing content.
It is deciding:

- what matters
- for whom
- in what form
- with what urgency
- and what needs to become formal documentation

This is a stronger "new way of working with AI inside organizations" story than generic meeting automation.

## 9. What the MVP Is

For a 4-5 hour hackathon, the MVP must stay narrow.

### Must ship

- user can upload or capture meeting audio
- Transcription Agent produces transcript text
- Meeting Agent produces structured operational state
- Attention Routing Agent produces 4 role-based briefings
- Document Agent produces at least one secretary-usable draft output
- one event page shows the briefings clearly
- one cross-event risk surface exists
- one or two believable risk signals are visible
- seeded demo data makes the system feel real

### Strongly preferred

- short explanation text for risk signals
- one "what changed since last meeting?" summary
- editable minutes preview before finalizing
- one narrow Query Agent flow

### Stretch only

- Telegram alerts
- scheduled background automation
- full live in-meeting streaming transcription
- polished export / docx generation
- calendar-heavy views
- broad multi-step autonomous behaviors

If time gets tight, cut stretch items immediately.

## 10. Why This Is Still Buildable

This stays feasible because we are not building:

- four separate apps
- four different databases
- complex permissions
- a fully autonomous multi-agent system
- deep Zoom / Meet / Teams integration

We are building:

- one meeting capture or upload input
- one transcript
- one structured extracted state
- one event page
- one briefing section with 4 tabs or cards
- one generated document preview for the secretary
- one cross-event risk summary

That is a very manageable product shape.

The simplest architecture is:

1. Transcription Agent creates transcript text from meeting audio
2. Meeting Agent creates one canonical structured state from the transcript
3. Attention Routing Agent generates four briefings from that state
4. Document Agent generates a secretary-usable draft from the transcript and structured state
5. Risk Agent derives risk signals from that state
6. Query Agent reads the same state if time remains

This is much safer than trying to generate everything directly from raw audio in one step.

For hackathon practicality, the demo can use:

- uploaded audio
- a pre-recorded meeting clip
- or a fast transcription step over a known sample recording

It does not need deep live meeting-platform integration to prove the concept.

## 11. What We Are Explicitly Not Trying to Win On

We are not trying to win on:

- best transcript
- best generic meeting summary
- best note-taking assistant
- best generic AI chat
- polished design system
- broad workflow coverage

We are trying to win on:

**the organization sees less clutter, better role-relevant action, and faster formal documentation from the same meeting source.**

That is the story to protect.

## 12. Demo Story

The best demo is short, visual, and controlled.

### Recommended sequence

1. Show the meeting capture or upload flow.
2. Explain that normally someone records the meeting, then manually rewrites it into minutes while everyone else has to read the same cluttered notes.
3. Upload a realistic SPSU-style recording or preloaded demo audio.
4. Run the transcription and Meeting Agent flow.
5. Show the extracted operational state.
6. Open the role-based briefing section.
7. Show how the Secretary, Organising Committee, CC/VCC, and President / EXCO each get a different useful slice.
8. Show the generated minutes or document draft for the secretary.
9. Point to one risk signal such as overloaded staffing or unresolved critical-path work.
10. Optionally ask one question through the Query Agent.

### Best "aha" moment

The strongest moment is:

**one meeting turns into four operational briefings and a usable documentation draft instead of one cluttered transcript plus manual follow-up.**

## 13. Why Judges May Care

This version of the idea is stronger because it shows that AI can do more than create more content.

It shows that AI can:

- reduce information clutter
- route relevance by role
- surface organizational risk
- make meetings operationally useful faster
- generate usable formal documentation from the same meeting source
- create new internal workflows, not just faster old workflows

That is exactly the kind of framing that feels more original in a crowded AI hackathon environment.

## 14. Team Translation

This section is the simplest explanation for teammates.

### Backend / AI person

Your job is to make the transcript-to-structured-state pipeline reliable.
If the transcript or structured extraction is weak, the rest of the system feels fake.

### Frontend person

Your job is to make the role-based briefings and generated document preview feel instantly legible.
The UI should prove that different roles really do need different slices and that the secretary gets usable output.

### Genspark / query person

Your job is to support the live operational state, not replace the main product story.
The query layer is there to deepen the system, not carry it.

### Pitch / business person

Your job is to keep the story centered on attention routing and role relevance.
Do not let the pitch collapse into "AI summarizes meetings."

## 15. The Core Sentence to Remember

If the team remembers only one line, it should be this:

**Most AI meeting tools create one summary for everyone. We turn one meeting into role-specific operational briefings and usable documentation, so each person sees only what they need to act on.**

## 16. Bottom Line

This idea is strongest when it is described as:

**AI-powered attention routing and documentation support for organizational work**

not:

- AI meeting notes
- AI meeting summary
- AI task extraction
- AI chatbot for operations

That framing gives the project:

- a clearer differentiator
- a more original angle
- a more agentic workflow story
- a more adoption-friendly output for secretaries
- and a build that is still realistic inside a 4-5 hour hackathon
