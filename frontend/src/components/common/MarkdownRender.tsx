import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownRendererPropsType = {
    keyIndex: string,
    content: string 
}

const MarkdownRenderer = ({ keyIndex, content }: MarkdownRendererPropsType) => { 
    return (
        <ReactMarkdown 
        key={keyIndex} 
        remarkPlugins={[remarkGfm]}
        components={{
            pre: ({ children }) => (
            <pre className="my-4 p-3 w-full min-w-0 overflow-x-auto rounded italic bg-black text-emerald-400">
                {children}
            </pre>
            ),
            code: ({ children }) => (
            <code className="whitespace-pre-wrap">
                {children}
            </code>
            ),
        }}
        >
            {content}
        </ReactMarkdown>
    )
}

export default MarkdownRenderer