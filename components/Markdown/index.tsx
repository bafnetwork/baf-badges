
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm';
import rehypeMathjax from 'rehype-mathjax';

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'

import "react-mde/lib/styles/css/react-mde-all.css";
import 'katex/dist/katex.min.css'

export interface MarkdownProps {
	md: string
}

export function Markdown({ md }: MarkdownProps) {

	return (
		<ReactMarkdown
			remarkPlugins={[remarkMath, remarkGfm]}
			rehypePlugins={[rehypeMathjax]}
			components={{
				code({node, inline, className, children, ...props}) {
					const match = /language-(\w+)/.exec(className || '')
					return !inline && match ? (
					<SyntaxHighlighter
						// eslint-disable-next-line react/no-children-prop
						children={String(children).replace(/\n$/, '')}
						style={ghcolors}
						language={match[1]}
						PreTag="div"
						{...(props as any)}
					/>
					) : (
					<code className={className} {...props}>
						{children}
					</code>
					)
				}
			}}
		>
			{md}
		</ReactMarkdown>
	)
}