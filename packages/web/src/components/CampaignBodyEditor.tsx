import { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QUILL_MODULES } from '@/lib/quill';

interface Props<T extends FieldValues> {
  /** react-hook-form control bound to the parent form */
  control: Control<T>;
  /** The field name registered in the parent form schema */
  name: Path<T>;
  /** Field-level validation error message */
  error?: string;
  /** Disables both the editor and the toggle when true */
  disabled?: boolean;
}

type Mode = 'edit' | 'preview';

/**
 * Controlled rich-text body editor with an Edit / Preview toggle.
 *
 * Both modes use ReactQuill so that h1/h2/h3, strong, em, lists etc. are
 * always rendered by Quill's own engine — no dependency on external CSS or
 * dangerouslySetInnerHTML to get heading/bold styles correct.
 *
 * - Edit mode:   ReactQuill with Snow toolbar (editable)
 * - Preview mode: ReactQuill with no toolbar and readOnly=true
 */
export function CampaignBodyEditor<T extends FieldValues>({
  control,
  name,
  error,
  disabled,
}: Props<T>) {
  const [mode, setMode] = useState<Mode>('edit');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>Email Body *</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            disabled={disabled}
            onClick={() => setMode('edit')}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            disabled={disabled}
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
        </div>
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          mode === 'edit' ? (
            <ReactQuill
              theme="snow"
              value={field.value as string}
              onChange={field.onChange}
              modules={QUILL_MODULES}
              readOnly={disabled}
            />
          ) : (
            <ReactQuill
              theme="snow"
              value={field.value as string}
              readOnly
              modules={{ toolbar: false }}
              className="quill-preview"
            />
          )
        }
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
