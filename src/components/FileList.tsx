import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { File, Download, Trash2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import FileUploader from './FileUploader';

interface FileItem {
    id: string;
    filename: string;
    type: string;
    description?: string;
    createdAt: string;
}

interface FileListProps {
    dataBucketId: string;
    bucketType: string; // T1-T20
    year: string;
    readOnly?: boolean;
}

export default function FileList({ dataBucketId, bucketType, year, readOnly = false }: FileListProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch files for this data bucket
    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/data-buckets/${dataBucketId}/files`);

            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }

            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to load files');
        } finally {
            setIsLoading(false);
        }
    };

    // Load files on component mount
    useEffect(() => {
        fetchFiles();
    }, [dataBucketId]);

    // Handle file upload complete
    const handleFileUploaded = () => {
        fetchFiles();
    };

    // Handle file download
    const handleDownload = async (fileId: string) => {
        try {
            const response = await fetch(`/api/files/${fileId}/download`);

            if (!response.ok) {
                throw new Error('Failed to get download URL');
            }

            const data = await response.json();

            // Open the URL in a new window/tab
            window.open(data.url, '_blank');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    // Handle file preview
    const handlePreview = async (file: FileItem) => {
        setSelectedFile(file);
        try {
            const response = await fetch(`/api/files/${file.id}/download`);

            if (!response.ok) {
                throw new Error('Failed to get preview URL');
            }

            const data = await response.json();
            setPreviewUrl(data.url);
        } catch (error) {
            console.error('Error previewing file:', error);
            toast.error('Failed to preview file');
            setPreviewUrl(null);
        }
    };

    // Handle file deletion
    const handleDelete = async (fileId: string) => {
        if (readOnly) return;

        setIsDeletingId(fileId);
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            toast.success('File deleted successfully');

            // Remove the file from the list
            setFiles(files.filter(file => file.id !== fileId));
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error('Failed to delete file');
        } finally {
            setIsDeletingId(null);
        }
    };

    // Get file icon based on file extension
    const getFileIcon = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();

        // You can expand this with more icons for different file types
        switch (extension) {
            case 'pdf':
                return <File className="h-5 w-5 text-red-500" />;
            case 'doc':
            case 'docx':
                return <File className="h-5 w-5 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <File className="h-5 w-5 text-green-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <File className="h-5 w-5 text-purple-500" />;
            default:
                return <File className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Attachments</h3>
                {!readOnly && (
                    <FileUploader
                        dataBucketId={dataBucketId}
                        type={bucketType}
                        year={year}
                        onFileUploaded={handleFileUploaded}
                    />
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
            ) : files.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No files attached</p>
                            {!readOnly && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Use the "Upload File" button to attach files
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {files.map((file) => (
                        <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getFileIcon(file.filename)}
                                        <div>
                                            <p className="text-sm font-medium">{file.filename}</p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(file.createdAt), 'MMM d, yyyy')}
                                                {file.description && ` • ${file.description}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handlePreview(file)}
                                                >
                                                    <ExternalLink className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-xl">
                                                <DialogHeader>
                                                    <DialogTitle>{selectedFile?.filename}</DialogTitle>
                                                </DialogHeader>
                                                {previewUrl ? (
                                                    <div className="overflow-hidden rounded-md border">
                                                        {/* For PDF preview */}
                                                        <iframe
                                                            src={previewUrl}
                                                            className="w-full h-[500px]"
                                                            title={selectedFile?.filename || 'File preview'}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center items-center h-[300px]">
                                                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDownload(file.id)}
                                        >
                                            <Download className="h-4 w-4 text-slate-500" />
                                        </Button>

                                        {!readOnly && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDelete(file.id)}
                                                disabled={isDeletingId === file.id}
                                            >
                                                {isDeletingId === file.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}