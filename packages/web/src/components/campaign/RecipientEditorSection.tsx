import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUpdateCampaignMutation } from '@/store/api';
import { newRecipientSchema, type NewRecipientFormValues } from '@/validations/campaign';
import { extractApiError } from '@/helpers/api-error';
import type { Campaign } from '@/models/campaign.type';

export function RecipientEditorSection({ campaign }: { campaign: Campaign }) {
  const [update, { isLoading }] = useUpdateCampaignMutation();
  const [deletedIds, setDeletedIds] = useState<Set<number>>(() => new Set());
  const [apiError, setApiError] = useState<string | null>(null);

  const visibleRecipients = campaign.recipients.filter((r) => !deletedIds.has(r.id));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewRecipientFormValues>({
    resolver: zodResolver(newRecipientSchema),
    defaultValues: { newRecipients: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'newRecipients' });

  function handleDeleteExisting(id: number) {
    setDeletedIds((prev) => new Set([...prev, id]));
  }

  async function onSave(values: NewRecipientFormValues) {
    setApiError(null);
    try {
      const recipients = [
        ...visibleRecipients.map((r) => ({ name: r.name, email: r.email })),
        ...values.newRecipients,
      ];
      await update({ id: campaign.id, recipients }).unwrap();
      toast.success('Recipients updated');
      setDeletedIds(new Set());
      reset({ newRecipients: [] });
    } catch (err) {
      setApiError(extractApiError(err, 'Failed to update recipients'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRecipients.length === 0 && fields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No recipients yet. Add some below.
              </TableCell>
            </TableRow>
          ) : (
            visibleRecipients.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteExisting(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Name"
                  {...register(`newRecipients.${index}.name`)}
                  disabled={isLoading}
                />
                {errors.newRecipients?.[index]?.name && (
                  <p className="text-xs text-destructive">
                    {errors.newRecipients[index].name?.message}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="email@example.com"
                  type="email"
                  {...register(`newRecipients.${index}.email`)}
                  disabled={isLoading}
                />
                {errors.newRecipients?.[index]?.email && (
                  <p className="text-xs text-destructive">
                    {errors.newRecipients[index].email?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', email: '' })}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Add Recipient
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Save Recipients
        </Button>
      </div>
    </form>
  );
}
