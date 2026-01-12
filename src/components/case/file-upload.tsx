'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn, formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Image, File, Loader2 } from 'lucide-react';

export type DocumentType =
  | 'SCREENSHOT'
  | 'CONTRACT'
  | 'INVOICE'
  | 'CORRESPONDENCE'
  | 'PHOTO_EVIDENCE'
  | 'IDENTITY'
  | 'BANK_STATEMENT'
  | 'COURT_DOCUMENT'
  | 'OTHER';

interface FileWithMetadata {
  file: File;
  documentType: DocumentType;
  description: string;
}

interface FileUploadProps {
  caseId: string;
  onUploadComplete?: (documents: any[]) => void;
  className?: string;
}

const documentTypeLabels: Record<DocumentType, { lt: string; en: string }> = {
  SCREENSHOT: { lt: 'Ekrano kopija', en: 'Screenshot' },
  CONTRACT: { lt: 'Sutartis', en: 'Contract' },
  INVOICE: { lt: 'Sąskaita', en: 'Invoice' },
  CORRESPONDENCE: { lt: 'Susirašinėjimas', en: 'Correspondence' },
  PHOTO_EVIDENCE: { lt: 'Nuotrauka', en: 'Photo Evidence' },
  IDENTITY: { lt: 'Tapatybės dokumentas', en: 'ID Document' },
  BANK_STATEMENT: { lt: 'Banko išrašas', en: 'Bank Statement' },
  COURT_DOCUMENT: { lt: 'Teismo dokumentas', en: 'Court Document' },
  OTHER: { lt: 'Kita', en: 'Other' },
};

export function FileUpload({ caseId, onUploadComplete, className }: FileUploadProps) {
  const { language, t } = useLanguage();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    const newFiles = acceptedFiles.map((file) => ({
      file,
      documentType: guessDocumentType(file) as DocumentType,
      description: '',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map((r) => {
        if (r.errors[0]?.code === 'file-too-large') {
          return language === 'lt'
            ? `${r.file.name}: Failas per didelis (maks. 10MB)`
            : `${r.file.name}: File too large (max 10MB)`;
        }
        return language === 'lt'
          ? `${r.file.name}: Netinkamas failo tipas`
          : `${r.file.name}: Invalid file type`;
      });
      setError(errors.join(', '));
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (
    index: number,
    field: 'documentType' | 'description',
    value: string
  ) => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      )
    );
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedDocs: any[] = [];

    try {
      for (const fileData of files) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append(
          'metadata',
          JSON.stringify({
            documentType: fileData.documentType,
            description: fileData.description,
          })
        );

        const response = await fetch(`/api/cases/${caseId}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${fileData.file.name}`);
        }

        const doc = await response.json();
        uploadedDocs.push(doc);
      }

      setFiles([]);
      onUploadComplete?.(uploadedDocs);
    } catch (err) {
      setError(
        language === 'lt'
          ? 'Klaida įkeliant failus. Bandykite dar kartą.'
          : 'Error uploading files. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-medium">
          {isDragActive
            ? language === 'lt'
              ? 'Paleiskite failus čia...'
              : 'Drop files here...'
            : t('form.uploadHint')}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {language === 'lt'
            ? 'JPG, PNG, PDF, DOC iki 10MB'
            : 'JPG, PNG, PDF, DOC up to 10MB'}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((fileData, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3 animate-slide-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(fileData.file)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileData.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">
                    {language === 'lt' ? 'Dokumento tipas' : 'Document Type'}
                  </Label>
                  <Select
                    value={fileData.documentType}
                    onValueChange={(value) =>
                      updateFileMetadata(index, 'documentType', value)
                    }
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {language === 'lt' ? label.lt : label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">
                    {language === 'lt' ? 'Aprašymas' : 'Description'}
                  </Label>
                  <Textarea
                    value={fileData.description}
                    onChange={(e) =>
                      updateFileMetadata(index, 'description', e.target.value)
                    }
                    placeholder={
                      language === 'lt'
                        ? 'Trumpas aprašymas...'
                        : 'Brief description...'
                    }
                    className="h-20 resize-none"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'lt' ? 'Įkeliama...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {language === 'lt'
                  ? `Įkelti ${files.length} failą(-us)`
                  : `Upload ${files.length} file(s)`}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to guess document type from file
function guessDocumentType(file: File): DocumentType {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type.startsWith('image/')) {
    if (name.includes('screen') || name.includes('shot') || name.includes('ekran')) {
      return 'SCREENSHOT';
    }
    return 'PHOTO_EVIDENCE';
  }

  if (name.includes('sutart') || name.includes('contract') || name.includes('agreement')) {
    return 'CONTRACT';
  }

  if (name.includes('sąskait') || name.includes('invoice') || name.includes('receipt')) {
    return 'INVOICE';
  }

  if (name.includes('bank') || name.includes('statement') || name.includes('išraš')) {
    return 'BANK_STATEMENT';
  }

  return 'OTHER';
}
