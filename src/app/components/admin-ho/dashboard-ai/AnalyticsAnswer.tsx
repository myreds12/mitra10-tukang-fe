import React from 'react'

// Some older responses stored emoji as repeated question marks. Remove only
// decorative prefixes, keeping normal question marks and data values intact.
export function cleanAnalyticsAnswer(content: string): string {
  const emoji = new RegExp('[\\p{Extended_Pictographic}\\p{Emoji_Presentation}\\uFE0F\\u200D]', 'gu')
  return content.replace(emoji, '').replace(/^([ \t]*(?:#{1,6}[ \t]+|[-*•][ \t]+|>[ \t]*)?(?:\*\*)?)\?{2,}[ \t]+(?=\S)/gm, '$1')
}

type Block =
  | {kind: 'heading'; text: string}
  | {kind: 'paragraph'; text: string}
  | {kind: 'quote'; text: string}
  | {kind: 'table'; header: string[]; rows: string[][]}
  | {kind: 'list'; ordered: boolean; items: string[]}

const tableCells = (line: string): string[] => {
  const text = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells = ['']
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '\\' && text[index + 1] === '|') { cells[cells.length - 1] += '|'; index++ }
    else if (text[index] === '|') cells.push('')
    else cells[cells.length - 1] += text[index]
  }
  return cells.map(cell => cell.trim())
}
const tableDivider = (line: string) => {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}
const listItem = (line: string) => line.match(/^\s*(?:([-*•])\s+|(\d+)[.)]\s+)(.*)$/)

export function parseAnalyticsAnswer(content: string): Block[] {
  const lines = cleanAnalyticsAnswer(content).replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {i++; continue}
    if (i + 1 < lines.length && line.includes('|') && tableDivider(lines[i + 1])) {
      const header = tableCells(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        rows.push(tableCells(lines[i])); i++
      }
      blocks.push({kind: 'table', header, rows}); continue
    }
    const heading = line.match(/^#{1,6}\s+(.+)$/) || line.match(/^\*\*([^*]+)\*\*\s*$/)
    if (heading) {blocks.push({kind: 'heading', text: heading[1]}); i++; continue}
    const list = listItem(line)
    if (list) {
      const ordered = Boolean(list[2]); const items: string[] = []
      while (i < lines.length) {
        const item = listItem(lines[i])
        if (!item || Boolean(item[2]) !== ordered) break
        items.push(item[3].trim()); i++
      }
      blocks.push({kind: 'list', ordered, items}); continue
    }
    if (/^>\s?/.test(line)) {blocks.push({kind: 'quote', text: line.replace(/^>\s?/, '')}); i++; continue}
    const paragraph = [line]; i++
    while (i < lines.length && lines[i].trim() && !listItem(lines[i]) && !/^\s*(?:#{1,6}\s|>\s?)/.test(lines[i]) && !/^\s*\*\*[^*]+\*\*\s*$/.test(lines[i]) && !(i + 1 < lines.length && lines[i].includes('|') && tableDivider(lines[i + 1]))) {
      paragraph.push(lines[i].trim()); i++
    }
    blocks.push({kind: 'paragraph', text: paragraph.join('\n')})
  }
  return blocks
}

function inline(text: string): React.ReactNode {
  return text.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*)/g).map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

function metric(item: string): {label: string; value: string} | null {
  const plain = item.replace(/\*\*/g, '').replace(/__/g, '')
  const match = plain.match(/^([^:]{1,65}):\s*((?:[~±≈+−-]\s*)?(?:Rp\s*)?\d[\s\S]*)$/i)
  return match ? {label: match[1].trim(), value: match[2].trim()} : null
}

export const AnalyticsAnswer: React.FC<{content: string}> = ({content}) => <div className='analytics-response'>
  {parseAnalyticsAnswer(content).map((block, index) => {
    if (block.kind === 'heading') return <h3 key={index}>{inline(block.text)}</h3>
    if (block.kind === 'paragraph') return <p key={index}>{inline(block.text)}</p>
    if (block.kind === 'quote') return <blockquote key={index}>{inline(block.text)}</blockquote>
    if (block.kind === 'table') {
      const columns = Array.from({length: Math.max(block.header.length, ...block.rows.map(row => row.length))}, (_, i) => i)
      return <div className='analytics-answer-table-wrap' key={index}><table><thead><tr>{columns.map(column => <th key={column} scope='col'>{inline(block.header[column] || '')}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{columns.map(column => <td key={column}>{inline(row[column] || '')}</td>)}</tr>)}</tbody></table></div>
    }
    const metrics = !block.ordered && block.items.length >= 2 && block.items.length <= 6 ? block.items.map(metric) : []
    if (metrics.length && metrics.every(Boolean)) return <div className='analytics-answer-metrics' key={index}>{metrics.map((item, itemIndex) => <div className='analytics-answer-metric' key={itemIndex}><span>{item!.label}</span><strong>{item!.value}</strong></div>)}</div>
    const Tag = block.ordered ? 'ol' : 'ul'
    return <Tag key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</Tag>
  })}
</div>
