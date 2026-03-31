import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CampaignBodyEditor } from '@/components/CampaignBodyEditor';
import { useCreateCampaignMutation } from '@/store/api';
import { createCampaignSchema, type CreateCampaignFormValues } from '@/validations/campaign';

export function NewCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: { recipients: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'recipients' });

  async function onSubmit(values: CreateCampaignFormValues) {
    setApiError(null);
    try {
      const body: Parameters<typeof createCampaign>[0] = {
        name: values.name,
        subject: values.subject,
        body: values.body,
      };
      if (values.recipients.length > 0) {
        body.recipients = values.recipients;
      }
      const result = await createCampaign(body).unwrap();
      void navigate(`/campaigns/${result.id}`);
    } catch (err: unknown) {
      const data = err as { data?: { error?: string } };
      setApiError(data?.data?.error ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/campaigns"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to campaigns
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Campaign</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g. Summer Promotion"
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="subject">Email Subject *</Label>
          <Input
            id="subject"
            placeholder="e.g. Don't miss our summer deals"
            {...register('subject')}
          />
          {errors.subject && (
            <p className="text-sm text-destructive">{errors.subject.message}</p>
          )}
        </div>

        {/* Body with Edit / Preview toggle */}
        <CampaignBodyEditor
          control={control}
          name="body"
          error={errors.body?.message}
          disabled={isLoading}
        />

        {/* Recipients */}
        <div className="space-y-3">
          <div>
            <Label>Recipients (optional)</Label>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter recipient email addresses. Each recipient requires a name and email.
            </p>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Alice"
                  {...register(`recipients.${index}.name`)}
                />
                {errors.recipients?.[index]?.name && (
                  <p className="text-xs text-destructive">
                    {errors.recipients[index].name?.message}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="alice@example.com"
                  type="email"
                  {...register(`recipients.${index}.email`)}
                />
                {errors.recipients?.[index]?.email && (
                  <p className="text-xs text-destructive">
                    {errors.recipients[index].email?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', email: '' })}
          >
            <Plus className="h-4 w-4" />
            Add recipient
          </Button>
        </div>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="animate-spin" />}
          Create Campaign
        </Button>
      </form>
    </div>
  );
}
