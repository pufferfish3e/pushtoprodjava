"use client"

import React from "react"

// Lightweight renderer for the markdown patterns Claude emits:
// # headings, **bold**, *italic*, - bullets, numbered lists, tables → point form, paragraphs
export function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0

  function parseTableRow(line: string): string[] {
    return line
      .split("|")
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1) // drop empty first/last from leading/trailing |
  }

  function isSeparatorRow(line: string): boolean {
    return /^\|[\s\-:|]+\|/.test(line)
  }

  function isTableRow(line: string): boolean {
    return line.trimStart().startsWith("|")
  }

  function renderInline(raw: string): React.ReactNode {
    const parts = raw.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={idx}>{part.slice(2, -2)}</strong>
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={idx}>{part.slice(1, -1)}</em>
      return part
    })
  }

  while (i < lines.length) {
    const line = lines[i]

    if (isTableRow(line)) {
      // Collect the full table block
      const tableLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i])
        i++
      }

      // Split into header, separator, data rows
      const nonSep = tableLines.filter(l => !isSeparatorRow(l))
      if (nonSep.length === 0) continue

      const headers = parseTableRow(nonSep[0])
      const dataRows = nonSep.slice(1)

      if (dataRows.length === 0) {
        // Table has only headers — render as a plain bullet list of headers
        const items = headers.map((h, idx) => (
          <li key={idx} className="text-sm text-muted-foreground">{renderInline(h)}</li>
        ))
        nodes.push(<ul key={`table-${i}`} className="my-1.5 ml-4 list-disc space-y-1">{items}</ul>)
        continue
      }

      const items = dataRows.map((row, rowIdx) => {
        const cells = parseTableRow(row)
        // Build "Header: Value · Header: Value …" or just value if single column
        const parts = headers.map((header, colIdx) => {
          const val = cells[colIdx] ?? ""
          if (!val) return null
          return (
            <span key={colIdx}>
              {colIdx > 0 && <span className="mx-1.5 text-muted-foreground/40">·</span>}
              {headers.length > 1 && (
                <span className="font-medium text-foreground/70">{header}: </span>
              )}
              {renderInline(val)}
            </span>
          )
        }).filter(Boolean)

        return (
          <li key={rowIdx} className="text-sm text-muted-foreground leading-relaxed">
            {parts}
          </li>
        )
      })

      nodes.push(
        <ul key={`table-${i}`} className="my-1.5 ml-4 list-disc space-y-1.5">
          {items}
        </ul>
      )

    } else if (/^###\s/.test(line)) {
      nodes.push(<h4 key={i} className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-foreground">{renderInline(line.replace(/^###\s/, ""))}</h4>)
      i++
    } else if (/^##\s/.test(line)) {
      nodes.push(<h3 key={i} className="mt-4 mb-1 text-sm font-semibold text-foreground">{renderInline(line.replace(/^##\s/, ""))}</h3>)
      i++
    } else if (/^#\s/.test(line)) {
      nodes.push(<h2 key={i} className="mt-4 mb-1 text-base font-semibold text-foreground">{renderInline(line.replace(/^#\s/, ""))}</h2>)
      i++
    } else if (/^[-*]\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^[-*]\s/, ""))}</li>)
        i++
      }
      nodes.push(<ul key={`ul-${i}`} className="my-1.5 ml-4 list-disc space-y-0.5 text-sm text-muted-foreground">{items}</ul>)
    } else if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\.\s/, ""))}</li>)
        i++
      }
      nodes.push(<ol key={`ol-${i}`} className="my-1.5 ml-4 list-decimal space-y-0.5 text-sm text-muted-foreground">{items}</ol>)
    } else if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2" />)
      i++
    } else {
      nodes.push(<p key={i} className="text-sm text-muted-foreground leading-relaxed">{renderInline(line)}</p>)
      i++
    }
  }

  return <div className="flex flex-col gap-0.5">{nodes}</div>
}
