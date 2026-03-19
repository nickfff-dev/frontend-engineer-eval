// components/task-composer/bulk-upload.tsx
'use client'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types/types'
import Papa from 'papaparse'

interface BulkUploadProps {
    onTasksParsed: (tasks: Partial<Task>[]) => void
}

export function BulkUpload({ onTasksParsed }: BulkUploadProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<Partial<Task>[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleFile = (file: File) => {
        setError(null)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const tasks: Partial<Task>[] = results.data.map((row: any, i) => {
                        if (!row.title || !row.type) throw new Error(`Row ${i + 1}: missing title or type`)
                        return {
                            title: row.title,
                            type: row.type,
                            description: row.description ?? '',
                            details: row.details ?? '',
                            amount: Number(row.amount ?? 0),
                            reward: Number(row.reward ?? 0),
                            allowMultipleSubmissions: row.allowMultipleSubmissions === 'true',
                            campaignId: row.campaignId ?? undefined,
                            status: 'active' as const,
                        }
                    })
                    setPreview(tasks)
                    onTasksParsed(tasks)
                    toast.success(`${tasks.length} tasks ready to import`)
                } catch (e: any) {
                    setError(e.message)
                }
            },
            error: (e) => setError(e.message),
        })
    }

    return (
        <div className="space-y-3">
            <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                }}
            >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop a CSV file here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Required columns: <code className="bg-muted px-1 rounded">title, type</code>
                    {' '}— Optional: <code className="bg-muted px-1 rounded">description, details, amount, reward, campaignId, allowMultipleSubmissions</code>
                </p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>

            {/* Download template */}
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => {
                    const csv = 'title,type,description,details,amount,reward,allowMultipleSubmissions,campaignId\nExample Task,social_media_posting,Description here,Detailed instructions,100,10,false,campaign-1'
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'task-template.csv'; a.click()
                }}
            >
                <FileText className="mr-1 h-3.5 w-3.5" /> Download CSV template
            </Button>

            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}

            {preview.length > 0 && (
                <div className="rounded-lg border divide-y text-sm max-h-48 overflow-y-auto">
                    {preview.map((t, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2">
                            <div>
                                <p className="font-medium">{t.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {t.type?.replace(/_/g, ' ')} · ${t.reward}
                                </p>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}