# Revised Hackathon Brief

Working title: `[PROJECT_NAME]`

Important note:
- project name is intentionally unset
- permanent design system is intentionally unset
- this document is about product clarity, scope control, and team execution

This is the polished working brief for the hackathon version of the idea.
It replaces the earlier "AI meeting notes -> dashboard" framing with the stronger differentiator:

**one meeting -> multiple role-specific operational briefings**

This is not just a note-taking tool.
It is a role-aware coordination layer for organizations.

## 1. Executive Summary

Most AI meeting tools generate one transcript, one summary, or one action-item list for everyone.
But organizations do not work that way.

Different roles need different slices of the same meeting:
- the Secretary needs documentation-critical details and ambiguity checks
- the Main Committee needs clear next actions
- the CC/VCC needs blockers and intervention points
- President / EXCO needs cross-event oversight and risk

Our product turns one messy meeting into:
- one structured operational record
- multiple role-specific briefings
- visible risk signals across active events

The core idea is simple:

**AI should not just summarize meetings. It should route the right information to the right role.**

## 2. The Real Problem

The obvious problem is that task information is buried in notes, minutes, PDFs, chats, and spreadsheets.

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

This is why the problem is stronger than "meeting notes are annoying."

The real pain is:

**the wrong people are forced to read the wrong level of information.**

## 3. Why This Problem Matters for SPSU

SPSU is a strong setting for this because:
- many events run across the academic year
- several events can overlap at the same time
- leadership and committee roles are clearly distinct
- one person can be assigned across multiple workstreams
- secretaries already create documentation, but visibility is still weak

That means SPSU does not just have a documentation problem.
It has an attention-allocation problem.

The people who need to act cannot easily see what matters to them.

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

**instead of generating one summary for everyone, we generate role-specific operational briefings from the same meeting.**

This changes the product category from:
- AI meeting notes

to:
- AI-powered attention routing for organizational work

That is a much more defensible and memorable perspective.

## 5. The Product Vision

We are building an AI-powered coordination layer for student-run organizations.

A user pastes raw meeting notes into the system.
From those notes, the system produces:

1. a structured operational state for the meeting
2. role-specific briefings for the people involved
3. risk signals that surface what needs attention
4. an optional natural-language query layer over the live state

The key outcome is this:

**one messy meeting becomes four clean, role-aware operational briefings.**

## 6. The Agent System

The product works best when explained as a small system of specialized internal agents.

### 1. Meeting Agent

Purpose:
- convert raw notes into structured operational state

Outputs:
- tasks
- owners
- deadlines
- blockers
- decisions
- urgency
- possible cross-event conflicts

This is the "what happened" layer.

### 2. Attention Routing Agent

Purpose:
- decide what part of the meeting matters to which role

Outputs:
- Secretary briefing
- Main Committee briefing
- CC/VCC briefing
- President / EXCO briefing

This is the "who needs to care about what" layer.

This is also the main differentiator.

### 3. Risk Agent

Purpose:
- surface risk that people may not notice quickly

Examples:
- overloaded person across events
- blocker with no clear owner
- urgent critical-path item close to the event date
- unresolved tasks carried across meetings

This is the "what needs attention now" layer.

### 4. Query Agent

Purpose:
- let people ask plain-English questions over the live operational state

Examples:
- "What changed since the last meeting?"
- "What still blocks Appreciation Dinner?"
- "Who is overloaded this week?"

This is the "how leadership retrieves insight quickly" layer.

Important scope note:
- the Query Agent is helpful, but not the core differentiator
- the Attention Routing Agent is the real novelty

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

This is a documentation-focused briefing.

### Main Committee / OC briefing

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

**AI-powered information classification and attention routing for organizational roles**

That is more original because the system is not just producing content.
It is deciding:
- what matters
- for whom
- in what form
- with what urgency

This is a stronger "new way of working with AI inside organizations" story than generic meeting automation.

## 9. What the MVP Is

For a 4-5 hour hackathon, the MVP must stay narrow.

### Must ship

- user can paste raw meeting notes
- Meeting Agent produces structured operational state
- Attention Routing Agent produces 4 role-based briefings
- one event page shows the briefings clearly
- one cross-event risk surface exists
- one or two believable risk signals are visible
- seeded demo data makes the system feel real

### Strongly preferred

- short explanation text for risk signals
- one "what changed since last meeting?" summary
- one narrow Query Agent flow

### Stretch only

- Telegram alerts
- scheduled background automation
- audio transcription
- export / docx generation
- calendar-heavy views
- broad multi-step autonomous behaviors

If time gets tight, cut stretch items immediately.

## 10. Why This Is Still Buildable

This stays feasible because we are not building:
- four separate apps
- four different databases
- complex permissions
- a fully autonomous multi-agent system

We are building:
- one meeting input
- one structured extracted state
- one event page
- one briefing section with 4 tabs or cards
- one cross-event risk summary

That is a very manageable product shape.

The simplest architecture is:

1. Meeting Agent creates one canonical structured state
2. Attention Routing Agent generates four briefings from that state
3. Risk Agent derives risk signals from that state
4. Query Agent reads the same state if time remains

This is much safer than trying to generate everything directly from raw notes.

## 11. What We Are Explicitly Not Trying to Win On

We are not trying to win on:
- best transcript
- best generic meeting summary
- best note-taking assistant
- best generic AI chat
- polished design system
- broad workflow coverage

We are trying to win on:

**the organization sees less clutter and more role-relevant action.**

That is the story to protect.

## 12. Demo Story

The best demo is short, visual, and controlled.

### Recommended sequence

1. Show the meeting note input.
2. Explain that normally everyone has to read the same messy notes or wait for formatted minutes.
3. Paste realistic SPSU-style notes.
4. Run the Meeting Agent.
5. Show the extracted operational state.
6. Open the role-based briefing section.
7. Show how the Secretary, Main Committee, CC/VCC, and President / EXCO each get a different useful slice.
8. Point to one risk signal such as overloaded staffing or unresolved critical-path work.
9. Optionally ask one question through the Query Agent.

### Best "aha" moment

The strongest moment is:

**one meeting turns into four operational briefings instead of one cluttered summary.**

## 13. Why Judges May Care

This version of the idea is stronger because it shows that AI can do more than create more content.

It shows that AI can:
- reduce information clutter
- route relevance by role
- surface organizational risk
- make meetings operationally useful faster
- create new internal workflows, not just faster old workflows

That is exactly the kind of framing that feels more original in a crowded AI hackathon environment.

## 14. Team Translation

This section is the simplest explanation for teammates.

### Backend / AI person

Your job is to make the canonical meeting state reliable.
If the structured extraction is weak, the rest of the system feels fake.

### Frontend person

Your job is to make the role-based briefings feel instantly legible.
The UI should prove that different roles really do need different slices.

### Genspark / query person

Your job is to support the live operational state, not replace the main product story.
The query layer is there to deepen the system, not carry it.

### Pitch / business person

Your job is to keep the story centered on attention routing and role relevance.
Do not let the pitch collapse into "AI summarizes meetings."

## 15. The Core Sentence to Remember

If the team remembers only one line, it should be this:

**Most AI meeting tools create one summary for everyone. We turn one meeting into role-specific operational briefings, so each person sees only what they need to act on.**

## 16. Bottom Line

This idea is strongest when it is described as:

**AI-powered attention routing for organizational work**

not:
- AI meeting notes
- AI meeting summary
- AI task extraction
- AI chatbot for operations

That framing gives the project:
- a clearer differentiator
- a more original angle
- a more agentic workflow story
- and a build that is still realistic inside a 4-5 hour hackathon
