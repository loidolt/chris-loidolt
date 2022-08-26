import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ children }) {
    return (
        <ReactMarkdown children={children} remarkPlugins={[remarkGfm]} linkTarget="_blank" />
    );
}